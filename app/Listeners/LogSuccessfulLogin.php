<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class LogSuccessfulLogin
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        if (! config('activity.enabled', true) || ! $event->user) {
            return;
        }

        // Prevent duplicate login logs within the same session
        $recentLogin = \Wave\ActivityLog::where('user_id', $event->user->id)
            ->where('action', 'login')
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();

        if (! $recentLogin) {
            \Wave\ActivityLog::log('login', 'User logged in successfully');
        }

        // Sync up to 10 email messages from connected Nylas accounts upon login
        try {
            $user = $event->user;
            if ($user && method_exists($user, 'nylasAccounts')) {
                $nylasService = app(\App\Services\NylasService::class);
                foreach ($user->nylasAccounts as $account) {
                    $response = $nylasService->getMessages($account->grant_id, [
                        'limit' => 10,
                    ]);
                    if ($response && isset($response['data']) && is_array($response['data'])) {
                        foreach ($response['data'] as $msg) {
                            $msgId = $msg['id'] ?? null;
                            if ($msgId) {
                                \App\Jobs\SyncNewEmailJob::dispatchSync($account->grant_id, $msgId);
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to sync emails on login: " . $e->getMessage());
        }
    }
}
