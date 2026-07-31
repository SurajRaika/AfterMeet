<?php

use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\NylasAccount;
use App\Models\User;
use App\Services\NylasService;
use Illuminate\Support\Facades\Http;
use Illuminate\Auth\Events\Login;
use Livewire\Volt\Volt;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to access dashboard inbox', function () {
    $this->get('/dashboard/inbox')
        ->assertRedirect(route('login'));
});

it('requires authentication to access email page', function () {
    $this->get('/email')
        ->assertRedirect(route('login'));
});

it('renders dashboard inbox and displays threads correctly for authenticated user', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-inbox',
        'email' => 'user-inbox@example.com',
    ]);

    $thread = EmailThread::create([
        'nylas_thread_id' => 'th-inbox-1',
        'nylas_account_id' => $account->id,
        'subject' => 'CRM Feature Inquiry',
        'last_message_at' => now(),
    ]);

    $message = EmailMessage::create([
        'nylas_message_id' => 'msg-inbox-1',
        'email_thread_id' => $thread->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'client@domain.com',
        'from_name' => 'Alice Client',
        'to' => [['email' => 'user-inbox@example.com']],
        'subject' => 'CRM Feature Inquiry',
        'body_snippet' => 'We are interested in your Laravel Wave template.',
        'body_html' => '<p>We are interested in your Laravel Wave template.</p>',
        'is_read' => false,
        'is_draft' => false,
        'received_at' => now(),
    ]);

    // Render the Livewire Volt page
    $response = $this->get('/dashboard/inbox');
    $response->assertStatus(200);
    $response->assertSee('CRM Feature Inquiry');
    $response->assertSee('Alice Client');
});

it('renders email page and displays threads correctly for authenticated user', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-email-page',
        'email' => 'user-email@example.com',
    ]);

    $thread = EmailThread::create([
        'nylas_thread_id' => 'th-email-1',
        'nylas_account_id' => $account->id,
        'subject' => 'Email Page CRM Inquiry',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-email-1',
        'email_thread_id' => $thread->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'client-email@domain.com',
        'from_name' => 'Bob Client',
        'to' => [['email' => 'user-email@example.com']],
        'subject' => 'Email Page CRM Inquiry',
        'body_snippet' => 'This is on the new email page.',
        'body_html' => '<p>This is on the new email page.</p>',
        'is_read' => false,
        'is_draft' => false,
        'received_at' => now(),
    ]);

    $response = $this->get('/email');
    $response->assertStatus(200);
    $response->assertSee('Email Page CRM Inquiry');
    $response->assertSee('Bob Client');
});

it('supports live search filtering of threads by subject or snippet', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-search',
        'email' => 'user-search@example.com',
    ]);

    $thread1 = EmailThread::create([
        'nylas_thread_id' => 'th-search-1',
        'nylas_account_id' => $account->id,
        'subject' => 'Alpha Proposal',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-search-1',
        'email_thread_id' => $thread1->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'alpha@example.com',
        'to' => [['email' => 'user-search@example.com']],
        'subject' => 'Alpha Proposal',
        'body_snippet' => 'Incredible deal',
        'is_read' => false,
        'is_draft' => false,
        'received_at' => now(),
    ]);

    $thread2 = EmailThread::create([
        'nylas_thread_id' => 'th-search-2',
        'nylas_account_id' => $account->id,
        'subject' => 'Beta Conversation',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-search-2',
        'email_thread_id' => $thread2->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'beta@example.com',
        'to' => [['email' => 'user-search@example.com']],
        'subject' => 'Beta Conversation',
        'body_snippet' => 'Another snippet',
        'is_read' => false,
        'is_draft' => false,
        'received_at' => now(),
    ]);

    Volt::test('dashboard.inbox')
        ->assertSee('Alpha Proposal')
        ->assertSee('Beta Conversation')
        ->set('searchQuery', 'Alpha')
        ->assertSee('Alpha Proposal')
        ->assertDontSee('Beta Conversation');
});

it('supports live search filtering of threads by subject or snippet on email page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-search-email',
        'email' => 'user-search-email@example.com',
    ]);

    $thread1 = EmailThread::create([
        'nylas_thread_id' => 'th-search-email-1',
        'nylas_account_id' => $account->id,
        'subject' => 'Gamma Proposal',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-search-email-1',
        'email_thread_id' => $thread1->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'gamma@example.com',
        'to' => [['email' => 'user-search-email@example.com']],
        'subject' => 'Gamma Proposal',
        'body_snippet' => 'Incredible gamma deal',
        'is_read' => false,
        'is_draft' => false,
        'received_at' => now(),
    ]);

    $thread2 = EmailThread::create([
        'nylas_thread_id' => 'th-search-email-2',
        'nylas_account_id' => $account->id,
        'subject' => 'Delta Conversation',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-search-email-2',
        'email_thread_id' => $thread2->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'delta@example.com',
        'to' => [['email' => 'user-search-email@example.com']],
        'subject' => 'Delta Conversation',
        'body_snippet' => 'Another delta snippet',
        'is_read' => false,
        'is_draft' => false,
        'received_at' => now(),
    ]);

    Volt::test('email')
        ->assertSee('Gamma Proposal')
        ->assertSee('Delta Conversation')
        ->set('searchQuery', 'Gamma')
        ->assertSee('Gamma Proposal')
        ->assertDontSee('Delta Conversation');
});

it('sends direct email and creates local records on compose submit', function () {
    $user = User::factory()->create(['email' => 'sender@example.com', 'name' => 'John Sender']);
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-compose',
        'email' => 'sender@example.com',
    ]);

    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-compose/messages/send' => Http::response([
            'data' => [
                'id' => 'mock-sent-msg-id',
                'thread_id' => 'mock-sent-thread-id',
                'subject' => 'Direct Compose Subject',
                'body' => 'Compose Body Content',
                'to' => [['email' => 'receiver@example.com']]
            ]
        ], 200)
    ]);

    expect(EmailThread::where('nylas_thread_id', 'mock-sent-thread-id')->exists())->toBeFalse();

    Volt::test('dashboard.inbox')
        ->set('selectedAccountId', (string) $account->id)
        ->set('toEmail', 'receiver@example.com')
        ->set('composeSubject', 'Direct Compose Subject')
        ->set('composeBody', 'Compose Body Content')
        ->call('sendEmail')
        ->assertHasNoErrors();

    $thread = EmailThread::where('nylas_thread_id', 'mock-sent-thread-id')->first();
    expect($thread)->not->toBeNull();
    expect($thread->subject)->toBe('Direct Compose Subject');

    $message = EmailMessage::where('nylas_message_id', 'mock-sent-msg-id')->first();
    expect($message)->not->toBeNull();
    expect($message->email_thread_id)->toBe($thread->id);
    expect($message->body_html)->toBe('Compose Body Content');
});

it('sends direct email and creates local records on compose submit on email page', function () {
    $user = User::factory()->create(['email' => 'sender@example.com', 'name' => 'John Sender']);
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-compose-email',
        'email' => 'sender@example.com',
    ]);

    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-compose-email/messages/send' => Http::response([
            'data' => [
                'id' => 'mock-sent-msg-email-id',
                'thread_id' => 'mock-sent-thread-email-id',
                'subject' => 'Email Page Compose Subject',
                'body' => 'Email Page Compose Content',
                'to' => [['email' => 'receiver-email@example.com']]
            ]
        ], 200)
    ]);

    expect(EmailThread::where('nylas_thread_id', 'mock-sent-thread-email-id')->exists())->toBeFalse();

    Volt::test('email')
        ->set('selectedAccountId', (string) $account->id)
        ->set('toEmail', 'receiver-email@example.com')
        ->set('composeSubject', 'Email Page Compose Subject')
        ->set('composeBody', 'Email Page Compose Content')
        ->call('sendEmail')
        ->assertHasNoErrors();

    $thread = EmailThread::where('nylas_thread_id', 'mock-sent-thread-email-id')->first();
    expect($thread)->not->toBeNull();
    expect($thread->subject)->toBe('Email Page Compose Subject');

    $message = EmailMessage::where('nylas_message_id', 'mock-sent-msg-email-id')->first();
    expect($message)->not->toBeNull();
    expect($message->email_thread_id)->toBe($thread->id);
    expect($message->body_html)->toBe('Email Page Compose Content');
});

it('sends direct reply on reply submit', function () {
    $user = User::factory()->create(['email' => 'me@example.com', 'name' => 'My Name']);
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-reply',
        'email' => 'me@example.com',
    ]);

    $thread = EmailThread::create([
        'nylas_thread_id' => 'thread-to-reply',
        'nylas_account_id' => $account->id,
        'subject' => 'Original Mail Subject',
        'last_message_at' => now()->subDay(),
    ]);

    $originalMessage = EmailMessage::create([
        'nylas_message_id' => 'msg-original-id',
        'email_thread_id' => $thread->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'sender-client@example.com',
        'from_name' => 'Alice Sender',
        'to' => [['email' => 'me@example.com']],
        'subject' => 'Original Mail Subject',
        'body_snippet' => 'Hello there',
        'is_read' => true,
        'received_at' => now()->subDay(),
    ]);

    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-reply/messages/send' => Http::response([
            'data' => [
                'id' => 'msg-reply-id-123',
                'thread_id' => 'thread-to-reply',
                'subject' => 'Re: Original Mail Subject',
                'body' => 'My inline reply text',
                'to' => [['email' => 'sender-client@example.com']]
            ]
        ], 200)
    ]);

    Volt::test('dashboard.inbox')
        ->set('selectedThreadId', $thread->id)
        ->set('replyBody', 'My inline reply text')
        ->call('sendReply')
        ->assertHasNoErrors();

    $replyMessage = EmailMessage::where('nylas_message_id', 'msg-reply-id-123')->first();
    expect($replyMessage)->not->toBeNull();
    expect($replyMessage->email_thread_id)->toBe($thread->id);
    expect($replyMessage->body_html)->toBe('My inline reply text');
});

it('sends direct reply on reply submit on email page', function () {
    $user = User::factory()->create(['email' => 'me@example.com', 'name' => 'My Name']);
    $this->actingAs($user);

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-reply-email',
        'email' => 'me@example.com',
    ]);

    $thread = EmailThread::create([
        'nylas_thread_id' => 'thread-to-reply-email',
        'nylas_account_id' => $account->id,
        'subject' => 'Original Mail Subject Email Page',
        'last_message_at' => now()->subDay(),
    ]);

    $originalMessage = EmailMessage::create([
        'nylas_message_id' => 'msg-original-id-email',
        'email_thread_id' => $thread->id,
        'nylas_account_id' => $account->id,
        'from_email' => 'sender-client@example.com',
        'from_name' => 'Alice Sender',
        'to' => [['email' => 'me@example.com']],
        'subject' => 'Original Mail Subject Email Page',
        'body_snippet' => 'Hello there email page',
        'is_read' => true,
        'received_at' => now()->subDay(),
    ]);

    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-reply-email/messages/send' => Http::response([
            'data' => [
                'id' => 'msg-reply-id-456',
                'thread_id' => 'thread-to-reply-email',
                'subject' => 'Re: Original Mail Subject Email Page',
                'body' => 'My inline reply text email page',
                'to' => [['email' => 'sender-client@example.com']]
            ]
        ], 200)
    ]);

    Volt::test('email')
        ->set('selectedThreadId', $thread->id)
        ->set('replyBody', 'My inline reply text email page')
        ->call('sendReply')
        ->assertHasNoErrors();

    $replyMessage = EmailMessage::where('nylas_message_id', 'msg-reply-id-456')->first();
    expect($replyMessage)->not->toBeNull();
    expect($replyMessage->email_thread_id)->toBe($thread->id);
    expect($replyMessage->body_html)->toBe('My inline reply text email page');
});

it('triggers email sync for up to 10 messages from Nylas account on user login', function () {
    $user = User::factory()->create();

    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-login-sync',
        'email' => 'user-login-sync@example.com',
    ]);

    // Mock Nylas API response for listing messages and details
    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-login-sync/messages?limit=10' => Http::response([
            'data' => [
                [
                    'id' => 'msg-login-1',
                    'thread_id' => 'th-login-1',
                    'subject' => 'Welcome message 1',
                    'snippet' => 'Hello user 1',
                    'from' => [['email' => 'welcome@domain.com', 'name' => 'Welcome Team']],
                    'to' => [['email' => 'user-login-sync@example.com']],
                    'date' => time(),
                    'unread' => true,
                    'is_draft' => false,
                ],
                [
                    'id' => 'msg-login-2',
                    'thread_id' => 'th-login-2',
                    'subject' => 'Welcome message 2',
                    'snippet' => 'Hello user 2',
                    'from' => [['email' => 'welcome@domain.com', 'name' => 'Welcome Team']],
                    'to' => [['email' => 'user-login-sync@example.com']],
                    'date' => time(),
                    'unread' => true,
                    'is_draft' => false,
                ]
            ]
        ], 200),
        'https://api.us.nylas.com/v3/grants/mock-grant-login-sync/messages/msg-login-1' => Http::response([
            'data' => [
                'id' => 'msg-login-1',
                'thread_id' => 'th-login-1',
                'subject' => 'Welcome message 1',
                'snippet' => 'Hello user 1',
                'body' => '<p>Hello user 1</p>',
                'from' => [['email' => 'welcome@domain.com', 'name' => 'Welcome Team']],
                'to' => [['email' => 'user-login-sync@example.com']],
                'date' => time(),
                'unread' => true,
                'is_draft' => false,
            ]
        ], 200),
        'https://api.us.nylas.com/v3/grants/mock-grant-login-sync/messages/msg-login-2' => Http::response([
            'data' => [
                'id' => 'msg-login-2',
                'thread_id' => 'th-login-2',
                'subject' => 'Welcome message 2',
                'snippet' => 'Hello user 2',
                'body' => '<p>Hello user 2</p>',
                'from' => [['email' => 'welcome@domain.com', 'name' => 'Welcome Team']],
                'to' => [['email' => 'user-login-sync@example.com']],
                'date' => time(),
                'unread' => true,
                'is_draft' => false,
            ]
        ], 200)
    ]);

    expect(EmailMessage::where('nylas_account_id', $account->id)->count())->toBe(0);

    // Fire login event
    event(new Login('web', $user, false));

    // Verify messages synced in local DB
    expect(EmailMessage::where('nylas_account_id', $account->id)->count())->toBe(2);
    expect(EmailThread::where('nylas_account_id', $account->id)->count())->toBe(2);

    $msg1 = EmailMessage::where('nylas_message_id', 'msg-login-1')->first();
    expect($msg1)->not->toBeNull();
    expect($msg1->subject)->toBe('Welcome message 1');
    expect($msg1->body_html)->toBe('<p>Hello user 1</p>');
});

it('prevents an authenticated user from viewing or selecting another user email thread', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $account1 = NylasAccount::create([
        'user_id' => $user1->id,
        'grant_id' => 'grant-u1',
        'email' => 'u1@example.com',
    ]);

    $account2 = NylasAccount::create([
        'user_id' => $user2->id,
        'grant_id' => 'grant-u2',
        'email' => 'u2@example.com',
    ]);

    $thread1 = EmailThread::create([
        'nylas_thread_id' => 'th-u1',
        'nylas_account_id' => $account1->id,
        'subject' => 'Secret User1 Proposal',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-u1',
        'email_thread_id' => $thread1->id,
        'nylas_account_id' => $account1->id,
        'from_email' => 'client-u1@example.com',
        'to' => [['email' => 'u1@example.com']],
        'subject' => 'Secret User1 Proposal',
        'body_snippet' => 'Hello user 1',
        'is_draft' => false,
        'received_at' => now(),
    ]);

    $thread2 = EmailThread::create([
        'nylas_thread_id' => 'th-u2',
        'nylas_account_id' => $account2->id,
        'subject' => 'Secret User2 Proposal',
        'last_message_at' => now(),
    ]);

    EmailMessage::create([
        'nylas_message_id' => 'msg-u2',
        'email_thread_id' => $thread2->id,
        'nylas_account_id' => $account2->id,
        'from_email' => 'client-u2@example.com',
        'to' => [['email' => 'u2@example.com']],
        'subject' => 'Secret User2 Proposal',
        'body_snippet' => 'Hello user 2',
        'is_draft' => false,
        'received_at' => now(),
    ]);

    // Log in as User 1
    $this->actingAs($user1);

    // Verify User 1 cannot see thread 2 in dashboard inbox list
    Volt::test('dashboard.inbox')
        ->assertSee('Secret User1 Proposal')
        ->assertDontSee('Secret User2 Proposal')
        ->call('selectThread', $thread2->id)
        ->assertSet('selectedThreadId', null);

    // Verify same restriction for /email page
    Volt::test('email')
        ->assertSee('Secret User1 Proposal')
        ->assertDontSee('Secret User2 Proposal')
        ->call('selectThread', $thread2->id)
        ->assertSet('selectedThreadId', null);
});

it('prevents an authenticated user from sending an email on behalf of another user connected account', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $account2 = NylasAccount::create([
        'user_id' => $user2->id,
        'grant_id' => 'grant-u2',
        'email' => 'u2@example.com',
    ]);

    // Log in as User 1
    $this->actingAs($user1);

    Volt::test('dashboard.inbox')
        ->set('selectedAccountId', (string) $account2->id)
        ->set('toEmail', 'client@example.com')
        ->set('composeSubject', 'Malicious Send')
        ->set('composeBody', 'Sending using another user account')
        ->call('sendEmail')
        ->assertHasErrors(['selectedAccountId']);

    Volt::test('email')
        ->set('selectedAccountId', (string) $account2->id)
        ->set('toEmail', 'client@example.com')
        ->set('composeSubject', 'Malicious Send')
        ->set('composeBody', 'Sending using another user account')
        ->call('sendEmail')
        ->assertHasErrors(['selectedAccountId']);
});

it('restricts emails on the prospect timeline to the active organization accounts', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create(); // Second tenant/user

    $account1 = NylasAccount::create([
        'user_id' => $user1->id,
        'grant_id' => 'grant-tenant1',
        'email' => 't1@example.com',
    ]);

    $account2 = NylasAccount::create([
        'user_id' => $user2->id,
        'grant_id' => 'grant-tenant2',
        'email' => 't2@example.com',
    ]);

    // Create a prospect for both users with the exact same contact email
    $prospect1 = \App\Models\Prospect::create([
        'tenant_id' => $user1->id,
        'company_name' => 'Acme',
        'contact_name' => 'John Doe',
        'contact_email' => 'johndoe@shared.com',
        'status' => 'active',
    ]);

    $prospect2 = \App\Models\Prospect::create([
        'tenant_id' => $user2->id,
        'company_name' => 'Globex',
        'contact_name' => 'John Doe',
        'contact_email' => 'johndoe@shared.com',
        'status' => 'active',
    ]);

    // Sync an email to user 1's account
    EmailMessage::create([
        'nylas_message_id' => 'msg-for-u1',
        'nylas_account_id' => $account1->id,
        'from_email' => 'johndoe@shared.com',
        'to' => [['email' => 't1@example.com']],
        'subject' => 'Acme Discussion Topic',
        'body_snippet' => 'Private Acme Content',
        'received_at' => now(),
    ]);

    // Sync an email to user 2's account
    EmailMessage::create([
        'nylas_message_id' => 'msg-for-u2',
        'nylas_account_id' => $account2->id,
        'from_email' => 'johndoe@shared.com',
        'to' => [['email' => 't2@example.com']],
        'subject' => 'Globex Discussion Topic',
        'body_snippet' => 'Private Globex Content',
        'received_at' => now(),
    ]);

    // Log in as User 1 and inspect Prospect 1's timeline
    $this->actingAs($user1);
    $response1 = $this->get(route('prospects.timeline', $prospect1->id));
    $response1->assertStatus(200);
    $response1->assertSee('Acme Discussion Topic');
    $response1->assertDontSee('Globex Discussion Topic');

    // Log in as User 2 and inspect Prospect 2's timeline
    $this->actingAs($user2);
    $response2 = $this->get(route('prospects.timeline', $prospect2->id));
    $response2->assertStatus(200);
    $response2->assertSee('Globex Discussion Topic');
    $response2->assertDontSee('Acme Discussion Topic');
});
