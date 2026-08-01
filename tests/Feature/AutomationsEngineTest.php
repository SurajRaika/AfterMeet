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
