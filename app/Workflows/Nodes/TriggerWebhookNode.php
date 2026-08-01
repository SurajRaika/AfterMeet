<?php

namespace App\Workflows\Nodes;

use App\Models\AutomationInstance;
use App\Workflows\WorkflowNode;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TriggerWebhookNode implements WorkflowNode
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function execute(AutomationInstance $instance, array $input): array
    {
        $prospect = $instance->prospect;
        if (!$prospect) {
            return ['status' => 'failed', 'error' => 'No prospect associated with instance.'];
        }

        $webhookUrl = $this->config['webhook_url'] ?? null;
        if (!$webhookUrl) {
            return ['status' => 'failed', 'error' => 'No webhook URL configured for TriggerWebhookNode.'];
        }

        $payload = [
            'event' => $input['event'] ?? 'prospect_event',
            'triggered_at' => now()->toDateTimeString(),
            'prospect' => [
                'id' => $prospect->id,
                'name' => $prospect->contact_name,
                'email' => $prospect->contact_email,
                'role' => $prospect->contact_role,
                'company' => $prospect->company_name,
                'status' => $prospect->status,
                'stage' => $prospect->stage,
            ],
            'input_data' => $input
        ];

        try {
            // Send secure HTTP POST request
            $response = Http::timeout(5)->post($webhookUrl, $payload);

            return [
                'status' => 'success',
                'response_status' => $response->status(),
                'response_body' => \Illuminate\Support\Str::limit($response->body(), 200),
            ];
        } catch (\Exception $e) {
            Log::warning("TriggerWebhookNode execution failed: " . $e->getMessage());
            return [
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }
}
