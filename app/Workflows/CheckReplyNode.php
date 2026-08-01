<?php

namespace App\Workflows;

use App\Models\AutomationInstance;
use App\Models\EmailMessage;
use Illuminate\Support\Facades\Log;

class CheckReplyNode implements WorkflowNode
{
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array
    {
        $prospect = $instance->prospect;
        $startedAt = $instance->started_at ?? $instance->created_at;

        Log::info("[CheckReplyNode] Checking if prospect {$prospect->contact_email} replied since {$startedAt}.");

        $hasReply = EmailMessage::where(function($query) use ($prospect) {
            $query->where('from_email', $prospect->contact_email)
                  ->orWhere('from_name', 'like', '%' . $prospect->contact_name . '%');
        })
        ->where('received_at', '>=', $startedAt)
        ->exists();

        Log::info("[CheckReplyNode] Reply check result: " . ($hasReply ? 'REPLIED' : 'NO REPLY'));

        return [
            'has_reply' => $hasReply,
        ];
    }
}
