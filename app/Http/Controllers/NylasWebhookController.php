<?php

namespace App\Http\Controllers;

use App\Models\NylasWebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NylasWebhookController extends Controller
{
    /**
     * Handle the Nylas webhook handshake and event payloads.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function handle(Request $request)
    {
        Log::info('[NYLAS WEBHOOK] Received request.', [
            'method' => $request->getMethod(),
            'url' => $request->fullUrl(),
            'headers' => $request->headers->all(),
            'query' => $request->query->all()
        ]);

        // 1. Challenge Handshake Verification (GET request)
        if ($request->isMethod('get') && $request->has('challenge')) {
            $challenge = $request->query('challenge');
            Log::info('[NYLAS WEBHOOK] Handshake challenge received: ' . $challenge);

            return response($challenge, 200)
                ->header('Content-Type', 'text/plain');
        }

        // 2. Webhook Event Handling (POST request)
        $signature = $request->header('X-Nylas-Signature');
        $webhookSecret = config('services.nylas.webhook_secret') ?? env('NYLAS_WEBHOOK_SECRET');

        Log::info('[NYLAS WEBHOOK] Checking signature and secret.', [
            'has_signature' => !empty($signature),
            'has_webhook_secret' => !empty($webhookSecret)
        ]);

        if (!$signature) {
            Log::warning('[NYLAS WEBHOOK] Missing X-Nylas-Signature header.');
            return response()->json(['error' => 'Missing signature'], 401);
        }

        $rawBody = $request->getContent();

        // If webhook secret is configured, we verify the signature to prevent spoofing
        if ($webhookSecret) {
            $calculatedSignature = hash_hmac('sha256', $rawBody, $webhookSecret);

            if (!hash_equals($signature, $calculatedSignature)) {
                Log::warning('[NYLAS WEBHOOK] Signature verification failed.', [
                    'received' => $signature,
                    'calculated' => $calculatedSignature
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }
            Log::info('[NYLAS WEBHOOK] Signature verified successfully.');
        } else {
            Log::warning('[NYLAS WEBHOOK] Webhook Secret is not configured, skipping verification.');
        }

        // Handle optional gzip compression
        if ($request->header('Content-Encoding') === 'gzip' || str_starts_with($rawBody, "\x1f\x8b")) {
            Log::info('[NYLAS WEBHOOK] Payload detected as gzipped. Attempting decompression...');
            $decompressed = @gzdecode($rawBody);
            if ($decompressed === false) {
                Log::warning('[NYLAS WEBHOOK] Failed to decompress gzipped body.');
                return response()->json(['error' => 'Failed to decompress body'], 400);
            }
            $rawBody = $decompressed;
            Log::info('[NYLAS WEBHOOK] Payload decompressed successfully.');
        }

        $payload = json_decode($rawBody, true);

        if (!$payload) {
            Log::warning('[NYLAS WEBHOOK] Invalid JSON payload.', [
                'raw_body_snippet' => substr($rawBody, 0, 1000)
            ]);
            return response()->json(['error' => 'Invalid JSON'], 400);
        }

        // Nylas v3 webhook payload formats:
        // Individual cloud event or an array of cloud events.
        // Let's store the event(s) in our database.
        Log::info('[NYLAS WEBHOOK] Parsed payload JSON successfully.', ['payload' => $payload]);

        if (isset($payload['type'])) {
            // Single event
            Log::info("[NYLAS WEBHOOK] Processing single event of type: {$payload['type']}");
            $this->logEvent($payload);
        } elseif (is_array($payload)) {
            // Array of events
            Log::info('[NYLAS WEBHOOK] Processing array of events, count: ' . count($payload));
            foreach ($payload as $event) {
                if (is_array($event) && isset($event['type'])) {
                    Log::info("[NYLAS WEBHOOK] Processing array element event of type: {$event['type']}");
                    $this->logEvent($event);
                } else {
                    Log::warning('[NYLAS WEBHOOK] Skipping non-array or type-less event in payload array.', ['event' => $event]);
                }
            }
        } else {
            Log::warning('[NYLAS WEBHOOK] Unknown payload format.');
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Store the webhook event in the database.
     *
     * @param array $event
     * @return void
     */
    protected function logEvent(array $event): void
    {
        $eventType = $event['type'] ?? 'unknown';
        $data = $event['data'] ?? [];
        $grantId = $data['grant_id'] ?? null;
        $objectId = $data['object']['id'] ?? null;

        Log::info('[NYLAS WEBHOOK LOG] Logging event to DB.', [
            'event_type' => $eventType,
            'grant_id' => $grantId,
            'object_id' => $objectId
        ]);

        try {
            NylasWebhookEvent::create([
                'event_type' => $eventType,
                'grant_id' => $grantId,
                'payload' => $event,
            ]);
            Log::info('[NYLAS WEBHOOK LOG] NylasWebhookEvent created successfully in database.');
        } catch (\Exception $e) {
            Log::error('[NYLAS WEBHOOK LOG] Failed to create NylasWebhookEvent in database: ' . $e->getMessage(), [
                'exception' => $e
            ]);
        }

        if ($eventType === 'message.created' && $grantId && $objectId) {
            Log::info("[NYLAS WEBHOOK LOG] Event is message.created. Dispatching SyncNewEmailJob for grant: {$grantId}, object: {$objectId}");
            \App\Jobs\SyncNewEmailJob::dispatch($grantId, $objectId);
        } else {
            Log::info("[NYLAS WEBHOOK LOG] Skipping SyncNewEmailJob dispatch. Event type is {$eventType}, or missing grantId/objectId.");
        }
    }
}
