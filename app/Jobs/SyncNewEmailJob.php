<?php

namespace App\Jobs;

use App\Models\EmailAttachment;
use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\NylasAccount;
use App\Services\NylasService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncNewEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $grantId;
    public string $objectId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $grantId, string $objectId)
    {
        $this->grantId = $grantId;
        $this->objectId = $objectId;
    }

    /**
     * Execute the job.
     */
    public function handle(NylasService $nylasService): void
    {
        Log::info("SyncNewEmailJob starting for grant ID: {$this->grantId}, message ID: {$this->objectId}");

        $account = NylasAccount::where('grant_id', $this->grantId)->first();

        if (!$account) {
            Log::warning("SyncNewEmailJob failed: No NylasAccount found for grant ID: {$this->grantId}");
            return;
        }

        try {
            $response = $nylasService->getMessage($this->grantId, $this->objectId);

            if (!$response || !isset($response['data'])) {
                Log::warning("SyncNewEmailJob failed: Could not retrieve message details from Nylas.", [
                    'response' => $response,
                ]);
                return;
            }

            $msgData = $response['data'];

            $nylasMessageId = $msgData['id'] ?? null;
            $nylasThreadId = $msgData['thread_id'] ?? null;

            if (!$nylasMessageId || !$nylasThreadId) {
                Log::warning("SyncNewEmailJob: Message payload missing ID or Thread ID.", [
                    'msgData' => $msgData,
                ]);
                return;
            }

            // Extract sender info safely
            $fromData = $msgData['from'] ?? [];
            $fromEmail = '';
            $fromName = '';
            if (!empty($fromData) && is_array($fromData)) {
                $fromEmail = $fromData[0]['email'] ?? '';
                $fromName = $fromData[0]['name'] ?? null;
            }

            // Fallback for sender email if empty
            if (empty($fromEmail)) {
                $fromEmail = 'unknown@example.com';
            }

            // Extract timestamp
            $receivedAtSec = $msgData['date'] ?? time();
            $receivedAt = Carbon::createFromTimestamp($receivedAtSec);

            // Handle read/unread
            $unread = $msgData['unread'] ?? false;
            $isRead = !$unread;

            // Subject and snippets
            $subject = $msgData['subject'] ?? '';
            $bodySnippet = $msgData['snippet'] ?? '';
            $bodyHtml = $msgData['body'] ?? '';

            // Handle thread creation/update
            $thread = EmailThread::updateOrCreate(
                ['nylas_thread_id' => $nylasThreadId],
                [
                    'nylas_account_id' => $account->id,
                    'subject' => $subject,
                ]
            );

            if (!$thread->last_message_at || $receivedAt->greaterThan($thread->last_message_at)) {
                $thread->update(['last_message_at' => $receivedAt]);
            }

            // Handle message creation/update
            $message = EmailMessage::updateOrCreate(
                ['nylas_message_id' => $nylasMessageId],
                [
                    'email_thread_id' => $thread->id,
                    'nylas_account_id' => $account->id,
                    'from_email' => $fromEmail,
                    'from_name' => $fromName,
                    'to' => $msgData['to'] ?? [],
                    'cc' => $msgData['cc'] ?? null,
                    'bcc' => $msgData['bcc'] ?? null,
                    'subject' => $subject,
                    'body_snippet' => $bodySnippet,
                    'body_html' => $bodyHtml,
                    'is_read' => $isRead,
                    'is_draft' => $msgData['is_draft'] ?? false,
                    'received_at' => $receivedAt,
                ]
            );

            // Handle attachments if any exist
            $attachments = $msgData['attachments'] ?? [];
            if (!empty($attachments) && is_array($attachments)) {
                foreach ($attachments as $att) {
                    $attId = $att['id'] ?? null;
                    if ($attId) {
                        EmailAttachment::updateOrCreate(
                            ['nylas_attachment_id' => $attId],
                            [
                                'email_message_id' => $message->id,
                                'filename' => $att['filename'] ?? 'attachment',
                                'content_type' => $att['content_type'] ?? 'application/octet-stream',
                                'size' => $att['size'] ?? 0,
                            ]
                        );
                    }
                }
            }

            Log::info("SyncNewEmailJob completed successfully. Synced message: {$nylasMessageId} inside thread: {$nylasThreadId}");

        } catch (\Exception $e) {
            Log::error("SyncNewEmailJob failed with exception: " . $e->getMessage(), [
                'exception' => $e,
            ]);
        }
    }
}
