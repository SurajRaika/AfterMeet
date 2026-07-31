<?php

use App\Models\User;
use App\Models\NylasAccount;
use Illuminate\Support\Facades\Http;

it('redirects guests to login when trying to connect Nylas', function () {
    $this->get(route('nylas.connect'))
        ->assertRedirect(route('login'));
});

it('redirects user to Nylas Hosted OAuth url', function () {
    $user = User::first() ?? User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('nylas.connect'));

    $expectedUrlStart = 'https://api.us.nylas.com/v3/connect/auth';
    $response->assertRedirect();
    $redirectUrl = $response->headers->get('Location');

    expect($redirectUrl)->toStartWith($expectedUrlStart);
    expect($redirectUrl)->toContain('client_id=mock-client-id');
    expect($redirectUrl)->toContain('response_type=code');
    expect($redirectUrl)->toContain('state=' . $user->id);
});

it('exchanges authorization code for grant_id and stores it', function () {
    \Illuminate\Support\Facades\Queue::fake();

    $user = User::first() ?? User::factory()->create();
    $this->actingAs($user);

    // Ensure database is clean
    $user->nylasAccounts()->delete();

    // Mock Nylas API token exchange
    Http::fake([
        'https://api.us.nylas.com/v3/connect/token' => Http::response([
            'access_token' => 'mock-access-token',
            'token_type' => 'Bearer',
            'id_token' => 'mock-id-token',
            'grant_id' => 'mock-grant-id-12345',
            'email' => 'connected-user@gmail.com',
        ], 200)
    ]);

    $response = $this->get(route('nylas.callback', [
        'code' => 'mock-auth-code',
        'state' => (string) $user->id,
    ]));

    $response->assertRedirect(route('settings.integrations'));
    $response->assertSessionHas('success');

    // Verify account is stored in the database and is_syncing is true
    $account = NylasAccount::where('user_id', $user->id)->first();
    expect($account)->not->toBeNull();
    expect($account->grant_id)->toBe('mock-grant-id-12345');
    expect($account->email)->toBe('connected-user@gmail.com');
    expect($account->is_syncing)->toBeTrue();

    // Verify NylasInitialSyncJob was dispatched
    \Illuminate\Support\Facades\Queue::assertPushed(\App\Jobs\NylasInitialSyncJob::class, function ($job) use ($account) {
        return $job->accountId === $account->id;
    });
});

it('NylasInitialSyncJob performs sync, updates is_syncing state', function () {
    $user = User::factory()->create();
    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-sync-job',
        'email' => 'connected-user@gmail.com',
        'is_syncing' => true,
    ]);

    // Mock getMessages
    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-sync-job/messages?limit=20' => Http::response([
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
        'https://api.us.nylas.com/v3/grants/mock-grant-sync-job/messages/mock-msg-sync-1' => Http::response([
            'data' => [
                'id' => 'mock-msg-sync-1',
                'thread_id' => 'mock-thread-sync',
                'subject' => 'Artisan Sync Test',
                'from' => [['email' => 'sender@example.com']],
                'date' => 1711900000,
            ]
        ], 200)
    ]);

    // Dispatch job synchronously
    \App\Jobs\NylasInitialSyncJob::dispatchSync($account->id);

    // After completion, is_syncing should be false, and message should be synced
    $account->refresh();
    expect($account->is_syncing)->toBeFalse();
    expect(\App\Models\EmailMessage::where('nylas_message_id', 'mock-msg-sync-1')->exists())->toBeTrue();
});

it('handles failed token exchange gracefully', function () {
    $user = User::first() ?? User::factory()->create();
    $this->actingAs($user);

    // Ensure database is clean
    $user->nylasAccounts()->delete();

    // Mock Nylas API returning an error
    Http::fake([
        'https://api.us.nylas.com/v3/connect/token' => Http::response([
            'error' => 'invalid_grant',
            'error_description' => 'The authorization code is invalid or expired.'
        ], 400)
    ]);

    $response = $this->get(route('nylas.callback', [
        'code' => 'invalid-auth-code',
        'state' => (string) $user->id,
    ]));

    $response->assertRedirect(route('settings.integrations'));
    $response->assertSessionHas('error');

    // Verify no account is created
    $account = NylasAccount::where('user_id', $user->id)->first();
    expect($account)->toBeNull();
});

it('prevents callback processing with invalid state parameter', function () {
    $user = User::first() ?? User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('nylas.callback', [
        'code' => 'mock-auth-code',
        'state' => 'wrong-state-parameter',
    ]));

    $response->assertRedirect(route('settings.integrations'));
    $response->assertSessionHas('error', 'Invalid state parameter.');
});

it('allows user to disconnect their Nylas account', function () {
    $user = User::first() ?? User::factory()->create();
    $this->actingAs($user);

    // Create a dummy account
    $account = NylasAccount::create([
        'user_id' => $user->id,
        'grant_id' => 'mock-grant-id-to-delete',
        'email' => 'to-delete@gmail.com'
    ]);

    expect(NylasAccount::find($account->id))->not->toBeNull();

    $response = $this->delete(route('nylas.disconnect', ['id' => $account->id]));

    $response->assertRedirect(route('settings.integrations'));
    $response->assertSessionHas('success');

    expect(NylasAccount::find($account->id))->toBeNull();
});
