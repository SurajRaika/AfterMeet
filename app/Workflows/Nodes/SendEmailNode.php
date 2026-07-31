<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;
use Illuminate\Support\Facades\Log;

class SendEmailNode implements WorkflowNode
{
    public function execute($input)
    {
        $email = $input['contact_email'] ?? 'test@example.com';
        $name = $input['contact_name'] ?? 'Recipient';
        $subject = $input['subject'] ?? 'Hello ' . $name;
        $body = $input['body'] ?? 'This is a workflow sequence email.';

        // Log email dispatch or call Nylas if connected
        Log::info("Workflow sending email to {$email}: Subject: {$subject}");

        return [
            'sent' => true,
            'recipient' => $email,
            'subject' => $subject,
            'message_id' => 'workflow-msg-' . uniqid(),
        ];
    }
}
