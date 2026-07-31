<?php

use App\Models\Blueprint;
use App\Models\BlueprintStep;
use App\Models\EmailMessage;
use App\Models\NylasAccount;
use App\Models\Prospect;
use App\Models\ProspectStepLog;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'user_' . uniqid() . '_' . rand(1000, 9999) . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('can view the prospect outreach timeline with distinct automated sends, replies, and matched conditions', function () {
    $this->actingAs($this->user);

    $tenantId = $this->user->organization_id ?? $this->user->id;

    // 1. Setup a connected Nylas Account to satisfy foreign keys
    $nylasAccount = NylasAccount::create([
        'user_id' => $this->user->id,
        'grant_id' => 'mock-grant-123',
        'email' => 'sender@me.com',
    ]);

    // 2. Setup a Blueprint & Template
    $template = Template::create([
        'tenant_id' => $tenantId,
        'name' => 'Cold Intro',
        'subject' => 'Hi {{contact_name}}',
        'body' => 'Would love to discuss SaaS expansion.',
    ]);

    $blueprint = Blueprint::create([
        'tenant_id' => $tenantId,
        'name' => 'Inbound Strategy',
    ]);

    $blueprintStep = BlueprintStep::create([
        'blueprint_id' => $blueprint->id,
        'step_order' => 0,
        'template_id' => $template->id,
        'wait_days' => 1,
    ]);

    // 3. Setup Prospect
    $prospect = Prospect::create([
        'tenant_id' => $tenantId,
        'company_name' => 'Initech Corp',
        'contact_name' => 'Peter Gibbons',
        'contact_email' => 'peter@initech.com',
        'status' => 'active',
        'blueprint_id' => $blueprint->id,
        'current_step_order' => 1,
    ]);

    // 4. Create Automated Step Log
    ProspectStepLog::create([
        'prospect_id' => $prospect->id,
        'blueprint_step_id' => $blueprintStep->id,
        'sent_at' => now()->subDays(2),
        'message_id' => 'nylas-msg-auto-999',
    ]);

    // Ensure EmailMessage table has a synced record for this automated mail as well
    EmailMessage::create([
        'nylas_message_id' => 'nylas-msg-auto-999',
        'nylas_account_id' => $nylasAccount->id,
        'from_email' => 'sender@me.com',
        'to' => [['email' => $prospect->contact_email]],
        'subject' => 'Hi Peter Gibbons',
        'body_snippet' => 'Would love to discuss SaaS expansion.',
        'body_html' => '<p>Would love to discuss SaaS expansion.</p>',
        'received_at' => now()->subDays(2),
    ]);

    // 5. Create an incoming Reply from Prospect (containing positive keyword "interested")
    EmailMessage::create([
        'nylas_message_id' => 'nylas-msg-reply-100',
        'nylas_account_id' => $nylasAccount->id,
        'from_email' => $prospect->contact_email,
        'to' => [['email' => 'sender@me.com']],
        'subject' => 'Re: Hi Peter Gibbons',
        'body_snippet' => 'Hey, I am interested, let us schedule a demo meeting.',
        'body_html' => '<p>Hey, I am interested, let us schedule a demo meeting.</p>',
        'received_at' => now()->subDays(1),
    ]);

    // 6. Create a manual user outbound response (User Emailed Back)
    EmailMessage::create([
        'nylas_message_id' => 'nylas-msg-manual-777',
        'nylas_account_id' => $nylasAccount->id,
        'from_email' => 'sender@me.com',
        'to' => [['email' => $prospect->contact_email]],
        'subject' => 'Re: Hi Peter Gibbons',
        'body_snippet' => 'Great, here is our booking link!',
        'body_html' => '<p>Great, here is our booking link!</p>',
        'received_at' => now(),
    ]);

    // 7. Request the timeline page
    $response = $this->get(route('prospects.timeline', $prospect->id));

    $response->assertStatus(200);

    // Verify it lists the profile data
    $response->assertSee('Peter Gibbons');
    $response->assertSee('peter@initech.com');
    $response->assertSee('Initech Corp');

    // Verify it handles Active status correctly
    $response->assertSee('Active Campaign');

    // Verify Timeline elements
    // - Automated step text
    $response->assertSee('AI Automated Send');
    $response->assertSee('Sequence Step 1');
    $response->assertSee('Cold Intro');

    // - Prospect response text
    $response->assertSee('Prospect Response Received');
    $response->assertSee('Hey, I am interested, let us schedule a demo meeting.');

    // - Matched positive interest condition
    $response->assertSee('Matched Action Condition: Positive Interest Detected');

    // - Manual user emailed back text
    $response->assertSee('User Emailed Back');
    $response->assertSee('Great, here is our booking link!');
});
