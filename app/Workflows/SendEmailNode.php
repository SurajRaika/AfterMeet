<?php

namespace App\Workflows;

use App\Models\AutomationInstance;
use App\Models\NylasAccount;
use App\Models\Template;
use App\Models\User;
use App\Services\NylasService;
use Illuminate\Support\Facades\Log;

class SendEmailNode implements WorkflowNode
{
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array
    {
        $prospect = $instance->prospect;
        $tenantId = $prospect->tenant_id;

        $userIds = [];
        if ($tenantId) {
            $userIds = User::where('organization_id', $tenantId)->pluck('id')->toArray();
            if (empty($userIds)) {
                $userIds = [$tenantId];
            }
        }

        $nylasAccount = NylasAccount::whereIn('user_id', $userIds)->first();
        $grantId = $nylasAccount ? $nylasAccount->grant_id : 'mock-grant-id';

        $subject = '';
        $body = '';

        if (!empty($nodeConfig['template_id'])) {
            $template = Template::find($nodeConfig['template_id']);
            if ($template) {
                $subject = Template::renderString($template->subject, $prospect);
                $body = Template::renderString($template->body, $prospect);
            }
        }

        if (empty($subject) && !empty($nodeConfig['subject'])) {
            $subject = Template::renderString($nodeConfig['subject'], $prospect);
        }
        if (empty($body) && !empty($nodeConfig['body'])) {
            $body = Template::renderString($nodeConfig['body'], $prospect);
        }

        if (empty($subject)) {
            $subject = 'Outreach follow up';
        }
        if (empty($body)) {
            $body = 'Hi ' . ($prospect->contact_name ?? 'there') . ', just wanted to check in!';
        }

        Log::info("[SendEmailNode] Preparing outreach email to: {$prospect->contact_email}", [
            'subject' => $subject,
            'grant_id' => $grantId,
        ]);

        $nylasService = new NylasService();
        $payload = [
            'to' => [
                ['email' => $prospect->contact_email, 'name' => $prospect->contact_name]
            ],
            'subject' => $subject,
            'body' => $body,
        ];

        try {
            $response = $nylasService->sendMessage($grantId, $payload);

            if ($response && isset($response['data']['id'])) {
                $messageId = $response['data']['id'];
                Log::info("[SendEmailNode] Email dispatched successfully.", ['message_id' => $messageId]);

                return [
                    'status' => 'sent',
                    'message_id' => $messageId,
                    'recipient' => $prospect->contact_email,
                    'subject' => $subject,
                ];
            } else {
                Log::warning("[SendEmailNode] Nylas rejected sending email.");
                return [
                    'status' => 'failed',
                    'error' => 'Nylas API rejected payload',
                ];
            }
        } catch (\Exception $e) {
            Log::error("[SendEmailNode] Exception sending email: " . $e->getMessage());
            return [
                'status' => 'failed',
                'error' => $e->getMessage(),
            ];
        }
    }
}
