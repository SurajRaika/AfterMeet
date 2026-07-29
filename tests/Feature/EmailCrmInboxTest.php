<?php

use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\NylasAccount;
use App\Models\User;
use App\Services\NylasService;
use Illuminate\Support\Facades\Http;
use Livewire\Volt\Volt;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to access dashboard inbox', function () {
    $this->get('/dashboard/inbox')
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
