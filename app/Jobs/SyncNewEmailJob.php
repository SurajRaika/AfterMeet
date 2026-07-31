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
        Log::info("[SYNC JOB] SyncNewEmailJob starting.", [
            'grant_id' => $this->grantId,
            'message_id' => $this->objectId
        ]);

        $account = NylasAccount::where('grant_id', $this->grantId)->first();

        if (!$account) {
            Log::warning("[SYNC JOB] FAILED: No NylasAccount found in local database for grant ID: {$this->grantId}");
            return;
        }

        Log::info("[SYNC JOB] Match found for NylasAccount in local DB.", [
            'account_id' => $account->id,
            'user_id' => $account->user_id,
            'email' => $account->email
        ]);

        try {
            Log::info("[SYNC JOB] Requesting message details from Nylas API...", [
                'grant_id' => $this->grantId,
                'message_id' => $this->objectId
            ]);

            $response = $nylasService->getMessage($this->grantId, $this->objectId);

            Log::info("[SYNC JOB] Nylas API response received.", [
                'has_response' => !empty($response),
                'has_data' => isset($response['data'])
            ]);

            if (!$response || !isset($response['data'])) {
                Log::warning("[SYNC JOB] FAILED: Could not retrieve message details from Nylas. Response payload empty or invalid.", [
                    'response' => $response,
                ]);
                return;
            }

            $msgData = $response['data'];

            $nylasMessageId = $msgData['id'] ?? null;
            $nylasThreadId = $msgData['thread_id'] ?? null;

            Log::info("[SYNC JOB] Message data details.", [
                'id' => $nylasMessageId,
                'thread_id' => $nylasThreadId,
                'subject' => $msgData['subject'] ?? 'No Subject',
                'date' => $msgData['date'] ?? null
            ]);

            if (!$nylasMessageId || !$nylasThreadId) {
                Log::warning("[SYNC JOB] FAILED: Message payload missing ID or Thread ID.", [
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

            Log::info("[SYNC JOB] Saving Thread and Message to database...", [
                'subject' => $subject,
                'from_email' => $fromEmail,
                'is_read' => $isRead,
                'received_at' => $receivedAt->toDateTimeString()
            ]);

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

            Log::info("[SYNC JOB] Thread and Message saved successfully.", [
                'thread_id_in_db' => $thread->id,
                'message_id_in_db' => $message->id
            ]);

            // Handle attachments if any exist
            $attachments = $msgData['attachments'] ?? [];
            if (!empty($attachments) && is_array($attachments)) {
                Log::info("[SYNC JOB] Message has attachments. Count: " . count($attachments));
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
                        Log::info("[SYNC JOB] Attachment synced.", ['filename' => $att['filename'] ?? 'attachment']);
                    }
                }
            }

            Log::info("[SYNC JOB] COMPLETED SUCCESSFULLY! Synced message: {$nylasMessageId} inside thread: {$nylasThreadId}");

        } catch (\Exception $e) {
            Log::error("[SYNC JOB] EXCEPTION FAILED: " . $e->getMessage(), [
                'exception' => $e,
            ]);
        }
    }
}
