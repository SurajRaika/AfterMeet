<?php

use App\Jobs\SyncNewEmailJob;
use App\Models\EmailAttachment;
use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\NylasAccount;
use App\Models\User;
use App\Services\NylasService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('dispatches SyncNewEmailJob on message.created webhook event', function () {
    Queue::fake();

    $user = User::factory()->create();
    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-webhook-grant',
        'email' => 'webhook-user@example.com',
    ]);

    $webhookSecret = 'mock-webhook-secret';
    config(['services.nylas.webhook_secret' => $webhookSecret]);

    $payload = [
        'type' => 'message.created',
        'data' => [
            'grant_id' => 'mock-webhook-grant',
            'object' => [
                'id' => 'mock-message-111',
                'object' => 'message'
            ]
        ]
    ];

    $rawBody = json_encode($payload);
    $signature = hash_hmac('sha256', $rawBody, $webhookSecret);

    $response = $this->withHeaders([
        'X-Nylas-Signature' => $signature,
    ])->postJson(route('webhooks.nylas'), $payload);

    $response->assertStatus(200);

    Queue::assertPushed(SyncNewEmailJob::class, function ($job) {
        return $job->grantId === 'mock-webhook-grant' && $job->objectId === 'mock-message-111';
    });
});

it('fetches and persists thread and message inside SyncNewEmailJob', function () {
    $user = User::factory()->create();
    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-xyz',
        'email' => 'user-xyz@example.com',
    ]);

    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-xyz/messages/mock-message-123' => Http::response([
            'data' => [
                'id' => 'mock-message-123',
                'thread_id' => 'mock-thread-abc',
                'subject' => 'Integration Proposal',
                'snippet' => 'Let us build a CRM reporting system.',
                'body' => '<h1>Proposal</h1><p>Let us build a CRM reporting system.</p>',
                'from' => [
                    ['name' => 'John Client', 'email' => 'client@example.com']
                ],
                'to' => [
                    ['name' => 'SaaS Team', 'email' => 'user-xyz@example.com']
                ],
                'date' => 1711900000,
                'unread' => true,
                'attachments' => [
                    [
                        'id' => 'att-1',
                        'filename' => 'invoice.pdf',
                        'content_type' => 'application/pdf',
                        'size' => 204800,
                    ]
                ]
            ]
        ], 200)
    ]);

    // Check pre-state
    expect(EmailThread::where('nylas_thread_id', 'mock-thread-abc')->exists())->toBeFalse();
    expect(EmailMessage::where('nylas_message_id', 'mock-message-123')->exists())->toBeFalse();

    // Execute job synchronously
    SyncNewEmailJob::dispatchSync('mock-grant-xyz', 'mock-message-123');

    // Check database
    $thread = EmailThread::where('nylas_thread_id', 'mock-thread-abc')->first();
    expect($thread)->not->toBeNull();
    expect($thread->subject)->toBe('Integration Proposal');

    $message = EmailMessage::where('nylas_message_id', 'mock-message-123')->first();
    expect($message)->not->toBeNull();
    expect($message->email_thread_id)->toBe($thread->id);
    expect($message->from_email)->toBe('client@example.com');
    expect($message->body_snippet)->toBe('Let us build a CRM reporting system.');
    expect($message->is_read)->toBeFalse();

    $attachment = EmailAttachment::where('nylas_attachment_id', 'att-1')->first();
    expect($attachment)->not->toBeNull();
    expect($attachment->email_message_id)->toBe($message->id);
    expect($attachment->filename)->toBe('invoice.pdf');
    expect($attachment->size)->toBe(204800);
});

it('executes the initial sync artisan command successfully', function () {
    $user = User::factory()->create();
    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-sync',
        'email' => 'user-sync@example.com',
    ]);

    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-sync/messages?limit=20' => Http::response([
            'data' => [
                [
                    'id' => 'mock-msg-sync-1',
                    'thread_id' => 'mock-thread-sync',
                    'subject' => 'Artisan Sync Test',
                    'from' => [['email' => 'sender@example.com']],
                    'date' => 1711900000,
                ]
            ]
        ], 200),
        'https://api.us.nylas.com/v3/grants/mock-grant-sync/messages/mock-msg-sync-1' => Http::response([
            'data' => [
                'id' => 'mock-msg-sync-1',
                'thread_id' => 'mock-thread-sync',
                'subject' => 'Artisan Sync Test',
                'from' => [['email' => 'sender@example.com']],
                'date' => 1711900000,
            ]
        ], 200)
    ]);

    $exitCode = Artisan::call('nylas:initial-sync', [
        'account_id' => $account->id
    ]);

    expect($exitCode)->toBe(0);
    expect(EmailThread::where('nylas_thread_id', 'mock-thread-sync')->exists())->toBeTrue();
    expect(EmailMessage::where('nylas_message_id', 'mock-msg-sync-1')->exists())->toBeTrue();
});
