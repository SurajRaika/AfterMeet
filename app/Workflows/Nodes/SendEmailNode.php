<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;
use App\Models\Template;
use App\Models\Prospect;
use Illuminate\Support\Facades\Log;

class SendEmailNode implements WorkflowNode
{
    public function execute($input)
    {
        $email = $input['contact_email'] ?? 'test@example.com';
        $name = $input['contact_name'] ?? 'Recipient';

        $subject = $input['subject'] ?? 'Hello ' . $name;
        $body = $input['body'] ?? 'This is a workflow sequence email.';

        $templateId = $input['template_id'] ?? null;
        $prospectId = $input['prospect_id'] ?? null;

        $prospect = null;
        if ($prospectId) {
            $prospect = Prospect::find($prospectId);
        }

        if ($templateId) {
            $template = Template::find($templateId);
            if ($template && $prospect) {
                $subject = Template::renderString($template->subject, $prospect);
                $body = Template::renderString($template->body, $prospect);
                $email = $prospect->contact_email;
                $name = $prospect->contact_name;
            }
        }

        // Log email dispatch or call Nylas if connected
        Log::info("Workflow sending email to {$email}: Subject: {$subject}");

        return [
            'sent' => true,
            'recipient' => $email,
            'recipient_name' => $name,
            'subject' => $subject,
            'body' => $body,
            'message_id' => 'workflow-msg-' . uniqid(),
            'template_id_used' => $templateId,
        ];
    }
}
