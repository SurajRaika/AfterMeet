<?php

namespace App\Console\Commands;

use App\Jobs\SyncNewEmailJob;
use App\Models\NylasAccount;
use App\Services\NylasService;
use Illuminate\Console\Command;

class NylasInitialSyncCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nylas:initial-sync {account_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Performs an initial sync of recent email messages from Nylas for the specified account ID';

    /**
     * Execute the console command.
     */
    public function handle(NylasService $nylasService): int
    {
        $accountId = $this->argument('account_id');
        $account = NylasAccount::find($accountId);

        if (!$account) {
            $this->error("Nylas account not found with ID: {$accountId}");
            return Command::FAILURE;
        }

        $this->info("Starting initial email sync for account: {$account->email} (Grant: {$account->grant_id})");

        try {
            $response = $nylasService->getMessages($account->grant_id, [
                'limit' => 20,
            ]);

            if (!$response || !isset($response['data']) || !is_array($response['data'])) {
                $this->error("Failed to retrieve messages from Nylas API.");
                return Command::FAILURE;
            }

            $messages = $response['data'];
            $total = count($messages);

            $this->info("Retrieved {$total} messages from Nylas. Syncing details...");

            $bar = $this->output->createProgressBar($total);
            $bar->start();

            foreach ($messages as $msg) {
                $msgId = $msg['id'] ?? null;
                if ($msgId) {
                    // Run the job synchronously to sync in-line and report progress
                    SyncNewEmailJob::dispatchSync($account->grant_id, $msgId);
                }
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Initial sync completed successfully!");

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->newLine();
            $this->error("An error occurred during sync: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
