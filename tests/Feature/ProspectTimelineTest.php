<?php

use App\Models\EmailMessage;
use App\Models\NylasAccount;
use App\Models\Prospect;
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

    // 2. Setup Prospect
    $prospect = Prospect::create([
        'tenant_id' => $tenantId,
        'company_name' => 'Initech Corp',
        'contact_name' => 'Peter Gibbons',
        'contact_email' => 'peter@initech.com',
        'status' => 'active',
    ]);

    // 3. Create a synced outbound message (sent by user)
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

    // 4. Create an incoming Reply from Prospect (containing positive keyword "interested")
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

    // 5. Create a manual user outbound response (User Emailed Back)
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

    // 6. Request the timeline page
    $response = $this->get(route('prospects.timeline', $prospect->id));

    $response->assertStatus(200);

    // Verify it lists the profile data
    $response->assertSee('Peter Gibbons');
    $response->assertSee('peter@initech.com');
    $response->assertSee('Initech Corp');

    // Verify Timeline elements
    // - Synced sent text
    $response->assertSee('Hi Peter Gibbons');
    $response->assertSee('Would love to discuss SaaS expansion.');

    // - Prospect response text
    $response->assertSee('Prospect Response Received');
    $response->assertSee('Hey, I am interested, let us schedule a demo meeting.');

    // - Matched positive interest condition
    $response->assertSee('Matched Action Condition: Positive Interest Detected');

    // - Manual user emailed back text
    $response->assertSee('User Emailed Back');
    $response->assertSee('Great, here is our booking link!');
});
