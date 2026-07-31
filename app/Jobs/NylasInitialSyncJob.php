<?php

namespace App\Jobs;

use App\Models\NylasAccount;
use App\Services\NylasService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NylasInitialSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $accountId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $accountId)
    {
        $this->accountId = $accountId;
    }

    /**
     * Execute the job.
     */
    public function handle(NylasService $nylasService): void
    {
        $account = NylasAccount::find($this->accountId);

        if (!$account) {
            Log::warning("NylasInitialSyncJob failed: No NylasAccount found for ID: {$this->accountId}");
            return;
        }

        Log::info("NylasInitialSyncJob starting for account: {$account->email} (Grant: {$account->grant_id})");

        // Mark account as syncing
        $account->update(['is_syncing' => true]);

        try {
            $response = $nylasService->getMessages($account->grant_id, [
                'limit' => 20,
            ]);

            if (!$response || !isset($response['data']) || !is_array($response['data'])) {
                Log::warning("NylasInitialSyncJob failed to retrieve messages from Nylas API.");
                return;
            }

            $messages = $response['data'];
            Log::info("NylasInitialSyncJob: retrieved " . count($messages) . " messages. Syncing details...");

            foreach ($messages as $msg) {
                $msgId = $msg['id'] ?? null;
                if ($msgId) {
                    // Synchronously sync details so we process them correctly in the background process
                    SyncNewEmailJob::dispatchSync($account->grant_id, $msgId);
                }
            }

            Log::info("NylasInitialSyncJob finished successfully for account: {$account->email}");

        } catch (\Exception $e) {
            Log::error("NylasInitialSyncJob exception occurred: " . $e->getMessage(), [
                'exception' => $e,
            ]);
        } finally {
            // Mark account as not syncing
            $account->update(['is_syncing' => false]);
        }
    }
}
