<?php

use App\Models\NylasWebhookEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('handles nylas webhook challenge handshake successfully', function () {
    $response = $this->get(route('webhooks.nylas', [
        'challenge' => 'test-handshake-challenge-12345'
    ]));

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    expect($response->getContent())->toBe('test-handshake-challenge-12345');
});

it('rejects nylas webhook post requests with missing signature', function () {
    $payload = [
        'type' => 'message.created',
        'data' => [
            'grant_id' => 'mock-grant-123',
            'object' => [
                'id' => 'mock-msg-123',
            ]
        ]
    ];

    $response = $this->postJson(route('webhooks.nylas'), $payload);

    $response->assertStatus(401);
});

it('verifies valid signature of gzipped request, decompresses, and logs event', function () {
    config(['services.nylas.webhook_secret' => 'my-test-secret']);

    $payload = [
        'type' => 'message.created',
        'data' => [
            'grant_id' => 'mock-grant-gzipped',
            'object' => [
                'id' => 'mock-msg-gzipped',
            ]
        ]
    ];

    $json = json_encode($payload);
    $gzippedBody = gzencode($json);

    // Signature computed over compressed bytes
    $signature = hash_hmac('sha256', $gzippedBody, 'my-test-secret');

    $countBefore = NylasWebhookEvent::count();

    $server = [
        'HTTP_X-NYLAS-SIGNATURE' => $signature,
        'HTTP_CONTENT-ENCODING' => 'gzip',
    ];

    $response = $this->call('POST', route('webhooks.nylas'), [], [], [], $server, $gzippedBody);

    $response->assertStatus(200);
    $response->assertJson(['status' => 'success']);

    expect(NylasWebhookEvent::count())->toBe($countBefore + 1);
    $event = NylasWebhookEvent::latest()->first();
    expect($event->event_type)->toBe('message.created');
    expect($event->grant_id)->toBe('mock-grant-gzipped');
    expect($event->payload)->toBe($payload);
});

it('verifies valid signature, logs event, and returns success', function () {
    // Temporarily set a webhook secret
    config(['services.nylas.webhook_secret' => 'my-test-secret']);

    $payload = [
        'type' => 'message.created',
        'data' => [
            'grant_id' => 'mock-grant-123',
            'object' => [
                'id' => 'mock-msg-123',
            ]
        ]
    ];

    $rawBody = json_encode($payload);
    $signature = hash_hmac('sha256', $rawBody, 'my-test-secret');

    // Count before post
    $countBefore = NylasWebhookEvent::count();

    $response = $this->withHeaders([
        'X-Nylas-Signature' => $signature,
    ])->postJson(route('webhooks.nylas'), $payload);

    $response->assertStatus(200);
    $response->assertJson(['status' => 'success']);

    // Check event was logged
    expect(NylasWebhookEvent::count())->toBe($countBefore + 1);
    $event = NylasWebhookEvent::latest()->first();
    expect($event->event_type)->toBe('message.created');
    expect($event->grant_id)->toBe('mock-grant-123');
    expect($event->payload)->toBe($payload);
});

it('rejects invalid signature with 401', function () {
    config(['services.nylas.webhook_secret' => 'my-test-secret']);

    $payload = [
        'type' => 'message.created',
        'data' => [
            'grant_id' => 'mock-grant-123'
        ]
    ];

    $response = $this->withHeaders([
        'X-Nylas-Signature' => 'invalid-signature-value',
    ])->postJson(route('webhooks.nylas'), $payload);

    $response->assertStatus(401);
});
