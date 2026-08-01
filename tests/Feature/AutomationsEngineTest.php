<?php

use App\Models\Automation;
use App\Models\AutomationInstance;
use App\Models\AutomationRun;
use App\Models\Prospect;
use App\Models\EmailMessage;
use App\Models\NylasAccount;
use App\Models\User;
use App\Workflows\WorkflowEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create a mock User first to satisfy foreign key constraints
    $user = User::factory()->create();

    // Create a mock NylasAccount satisfying foreign keys
    $nylasAccount = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock_grant_id',
        'email' => 'agent@wavecrm.com',
    ]);

    // Seed default automation templates
    $seeder = new \Database\Seeders\AutomationsTableSeeder();
    $seeder->run();
});

test('Test 1 (Unsubscribe flow): Assign Smart Inbox and process unsubscribe email', function () {
    // Get the first user we created
    $user = User::first();

    // Create a test prospect
    $prospect = Prospect::create([
        'tenant_id' => $user->id,
        'company_name' => 'Initech Corp',
        'contact_name' => 'Peter Gibbons',
        'contact_email' => 'peter@initech.com',
        'contact_role' => 'Developer',
        'status' => 'active',
        'stage' => 'Engaged',
    ]);

    // Retrieve the Smart Inbox Assistant automation
    $automation = Automation::where('name', 'Smart Inbox Assistant')->first();
    expect($automation)->not->toBeNull();

    // Trigger the workflow engine on email received
    $engine = new WorkflowEngine();
    $engine->triggerEmailReceived($prospect, "Please remove me from this list");

    // Retrieve the instance
    $instance = AutomationInstance::where('prospect_id', $prospect->id)
        ->where('automation_id', $automation->id)
        ->first();

    expect($instance)->not->toBeNull();
    expect($instance->status)->toBe('completed');

    // Retrieve the IntentNode execution run log
    $intentRun = AutomationRun::where('instance_id', $instance->id)
        ->where('node_id', 'node_run_intent')
        ->first();

    expect($intentRun)->not->toBeNull();
    expect($intentRun->output_payload['intent'])->toBe('unsubscribed');

    // Assert that the engine correctly updated the prospect's status and stage
    $prospect->refresh();
    expect($prospect->status)->toBe('Blocked');
    expect($prospect->stage)->toBe('Archived');
});

test('Test 2 (Booking flow): Assign Smart Inbox and process book call email', function () {
    // Get the first user we created
    $user = User::first();

    // Create a test prospect
    $prospect = Prospect::create([
        'tenant_id' => $user->id,
        'company_name' => 'Acme Inc',
        'contact_name' => 'Wile E. Coyote',
        'contact_email' => 'wile@acme.com',
        'contact_role' => 'Genius',
        'status' => 'active',
        'stage' => 'Engaged',
    ]);

    // Retrieve the Smart Inbox Assistant automation
    $automation = Automation::where('name', 'Smart Inbox Assistant')->first();
    expect($automation)->not->toBeNull();

    // Trigger the workflow engine on email received
    $engine = new WorkflowEngine();
    $engine->triggerEmailReceived($prospect, "Can we talk on Friday? Send me your calendar link.");

    // Retrieve the instance
    $instance = AutomationInstance::where('prospect_id', $prospect->id)
        ->where('automation_id', $automation->id)
        ->first();

    expect($instance)->not->toBeNull();
    expect($instance->status)->toBe('completed');

    // Retrieve the IntentNode execution run log
    $intentRun = AutomationRun::where('instance_id', $instance->id)
        ->where('node_id', 'node_run_intent')
        ->first();

    expect($intentRun)->not->toBeNull();
    expect($intentRun->output_payload['intent'])->toBe('book_call');

    // Assert that the engine triggered the SendEmailNode with the calendar link
    $emailSent = EmailMessage::where('crm_contact_id', $prospect->id)
        ->where('subject', "Let's schedule a call!")
        ->first();

    expect($emailSent)->not->toBeNull();
    expect($emailSent->body_html)->toContain('https://calendly.com/wave-ai/15min');
});

test('Test 3 (Event triggers & Webhook delivery): Create prospect and assert webhook sends POST', function () {
    // Fake outgoing HTTP calls
    Http::fake();

    // Get the first user we created
    $user = User::first();

    // Retrieve and activate the Prospect Created Workflow
    $automation = Automation::where('name', 'Prospect Created Workflow')->first();
    expect($automation)->not->toBeNull();

    // Customize the webhook destination URL
    $definition = $automation->workflow_definition;
    $definition['nodes']['node_trigger_webhook_created']['config']['webhook_url'] = 'https://my-webhook.com/event';
    $automation->workflow_definition = $definition;
    $automation->is_active = true;
    $automation->save();

    // Create a new Prospect, which should automatically trigger the Prospect Created Workflow via Eloquent booted hook
    $prospect = Prospect::create([
        'tenant_id' => $user->id,
        'company_name' => 'Cyberdyne Systems',
        'contact_name' => 'John Connor',
        'contact_email' => 'john@cyberdyne.com',
        'contact_role' => 'Leader',
        'status' => 'new',
        'stage' => 'New',
    ]);

    // Retrieve the instance
    $instance = AutomationInstance::where('prospect_id', $prospect->id)
        ->where('automation_id', $automation->id)
        ->first();

    expect($instance)->not->toBeNull();
    expect($instance->status)->toBe('completed');

    // Assert that the webhook POST request was sent to the configured URL with the correct payload
    Http::assertSent(function ($request) use ($prospect) {
        return $request->url() === 'https://my-webhook.com/event' &&
               $request['event'] === 'prospect_created' &&
               $request['prospect']['email'] === 'john@cyberdyne.com';
    });
});

test('Test 4 (Automation Duplication): Replicate an existing template and verify duplicated record', function () {
    $user = User::first();
    $this->actingAs($user);

    $original = Automation::first();
    expect($original)->not->toBeNull();

    $response = $this->post(route('automations.duplicate', $original->id));
    $response->assertRedirect(route('automations.index'));

    $duplicate = Automation::where('name', $original->name . ' (Copy)')->first();
    expect($duplicate)->not->toBeNull();
    expect($duplicate->is_active)->toBeFalse();
    expect($duplicate->workflow_definition)->toBe($original->workflow_definition);
});

test('Test 5 (Manual Trigger): Start an automation manually for a prospect and verify execution', function () {
    $user = User::first();
    $this->actingAs($user);

    $prospect = Prospect::create([
        'tenant_id' => $user->id,
        'company_name' => 'Duplication Corp',
        'contact_name' => 'Copy Cat',
        'contact_email' => 'copy@cat.com',
        'status' => 'new',
    ]);

    $automation = Automation::where('name', 'Cold Outreach Sequence')->first();
    expect($automation)->not->toBeNull();

    // Make it active so it can be used
    $automation->is_active = true;
    $automation->save();

    // Post to trigger it
    $response = $this->post(route('automations.trigger', $automation->id), [
        'prospect_id' => $prospect->id,
    ]);

    $response->assertRedirect(route('automations.runs', $automation->id));

    $instance = AutomationInstance::where('prospect_id', $prospect->id)
        ->where('automation_id', $automation->id)
        ->first();

    expect($instance)->not->toBeNull();
    expect($instance->status)->toBe('completed');
});
