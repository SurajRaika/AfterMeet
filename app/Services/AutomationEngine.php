<?php

namespace App\Services;

use App\Models\Automation;
use App\Models\AutomationInstance;
use App\Models\AutomationRun;
use App\Models\Prospect;
use App\Jobs\ExecuteAutomationInstanceJob;
use Illuminate\Support\Facades\Log;

class AutomationEngine
{
    public static array $nodeMapping = [
        'SendEmailNode' => \App\Workflows\SendEmailNode::class,
        'DelayNode' => \App\Workflows\DelayNode::class,
        'IntentNode' => \App\Workflows\IntentNode::class,
        'ConditionNode' => \App\Workflows\ConditionNode::class,
        'CheckReplyNode' => \App\Workflows\CheckReplyNode::class,
        'UpdateProspectNode' => \App\Workflows\UpdateProspectNode::class,
    ];

    /**
     * Start a new automation instance for a prospect.
     */
    public function start(Automation $automation, Prospect $prospect, array $initialPayload = []): ?AutomationInstance
    {
        Log::info("[AutomationEngine] Starting automation '{$automation->name}' (ID: {$automation->id}) for prospect '{$prospect->contact_email}'");

        $instance = AutomationInstance::create([
            'automation_id' => $automation->id,
            'prospect_id' => $prospect->id,
            'status' => 'active',
            'current_node' => null,
            'started_at' => now(),
        ]);

        $definition = $automation->workflow_definition;
        $startNodeId = $definition['start_node_id'] ?? null;

        if (empty($startNodeId)) {
            $nodes = $definition['nodes'] ?? [];
            $startNodeId = !empty($nodes) ? array_key_first($nodes) : null;
        }

        if (empty($startNodeId)) {
            Log::warning("[AutomationEngine] Automation ID {$automation->id} has no start node or nodes defined.");
            $instance->update(['status' => 'completed']);
            return $instance;
        }

        ExecuteAutomationInstanceJob::dispatch($instance->id, $startNodeId, $initialPayload);

        return $instance;
    }

    /**
     * Execute a specific node/step of an automation instance.
     */
    public function executeStep(AutomationInstance $instance, string $nodeId, array $inputPayload = []): void
    {
        Log::info("[AutomationEngine] Executing step '{$nodeId}' for instance {$instance->id} (status: {$instance->status})");

        if ($instance->status === 'paused') {
            $instance->update(['status' => 'active']);
        }

        if ($instance->status !== 'active') {
            Log::warning("[AutomationEngine] Skipping step execution. Instance {$instance->id} status is '{$instance->status}'");
            return;
        }

        $instance->update(['current_node' => $nodeId]);

        $definition = $instance->automation->workflow_definition;
        $nodes = $definition['nodes'] ?? [];
        $nodeConfig = $nodes[$nodeId] ?? null;

        if (!$nodeConfig) {
            Log::error("[AutomationEngine] Node config not found for node ID '{$nodeId}' in automation {$instance->automation_id}");
            $instance->update(['status' => 'failed']);
            return;
        }

        $nodeType = $nodeConfig['type'] ?? null;
        $nodeClass = self::$nodeMapping[$nodeType] ?? null;

        if (!$nodeClass) {
            Log::error("[AutomationEngine] Unsupported node type '{$nodeType}' for node ID '{$nodeId}'");
            $instance->update(['status' => 'failed']);
            return;
        }

        $runLog = AutomationRun::create([
            'instance_id' => $instance->id,
            'node_id' => $nodeId,
            'input_payload' => $inputPayload,
            'status' => 'running',
        ]);

        try {
            /** @var \App\Workflows\WorkflowNode $nodeInstance */
            $nodeInstance = new $nodeClass();
            $outputPayload = $nodeInstance->execute($instance, $nodeConfig['config'] ?? [], $inputPayload);

            $runLog->update([
                'output_payload' => $outputPayload,
                'status' => 'success',
            ]);

            if (isset($outputPayload['status']) && $outputPayload['status'] === 'paused') {
                Log::info("[AutomationEngine] Node '{$nodeId}' paused execution. Yielding control.");
                return;
            }

            $nextNodeId = null;
            if (isset($outputPayload['next_node_id'])) {
                $nextNodeId = $outputPayload['next_node_id'];
            } else {
                $nextNodeId = $nodeConfig['next'] ?? null;
            }

            if ($nextNodeId) {
                ExecuteAutomationInstanceJob::dispatch($instance->id, $nextNodeId, $outputPayload);
            } else {
                Log::info("[AutomationEngine] Automation instance {$instance->id} completed sequence successfully.");
                $instance->update(['status' => 'completed']);
            }

        } catch (\Exception $e) {
            Log::error("[AutomationEngine] Failed executing step '{$nodeId}' for instance {$instance->id}: " . $e->getMessage());
            $runLog->update([
                'status' => 'failed',
                'error_message' => $e->getMessage() . "\n" . $e->getTraceAsString(),
            ]);
            $instance->update(['status' => 'failed']);
        }
    }

    /**
     * Hook to handle incoming email sync and trigger appropriate automations or pause active outreach flows.
     */
    public function handleIncomingEmail(string $fromEmail, string $subject, string $body, string $grantId): void
    {
        Log::info("[AutomationEngine] Incoming email hook triggered for sender: {$fromEmail}");

        $account = \App\Models\NylasAccount::where('grant_id', $grantId)->first();
        if (!$account) {
            Log::warning("[AutomationEngine] No matching NylasAccount found for grant ID: {$grantId}");
            return;
        }

        $tenantId = $account->user->organization_id ?? $account->user_id;

        $prospect = \App\Models\Prospect::where('tenant_id', $tenantId)
            ->where('contact_email', $fromEmail)
            ->first();

        if (!$prospect) {
            Log::info("[AutomationEngine] No matching prospect found for {$fromEmail} under tenant {$tenantId}");
            return;
        }

        $emailText = $body ?: $subject;

        $triggerAutomations = \App\Models\Automation::where('tenant_id', $tenantId)
            ->where('type', 'trigger')
            ->where('is_active', true)
            ->get();

        foreach ($triggerAutomations as $automation) {
            $exists = \App\Models\AutomationInstance::where('automation_id', $automation->id)
                ->where('prospect_id', $prospect->id)
                ->whereIn('status', ['active', 'paused'])
                ->exists();

            if (!$exists) {
                Log::info("[AutomationEngine] Triggering automation '{$automation->name}' for prospect {$prospect->contact_email}");
                $this->start($automation, $prospect, [
                    'email_text' => $emailText,
                    'subject' => $subject,
                    'body' => $body,
                ]);
            }
        }

        $runningInstances = \App\Models\AutomationInstance::where('prospect_id', $prospect->id)
            ->whereIn('status', ['active', 'paused'])
            ->whereHas('automation', function($query) {
                $query->where('type', 'action');
            })
            ->get();

        if ($runningInstances->isNotEmpty()) {
            $intentNode = new \App\Workflows\IntentNode();
            $dummyInstance = $runningInstances->first();
            $intentResult = $intentNode->execute($dummyInstance, [], ['email_text' => $emailText]);
            $intent = $intentResult['intent'] ?? 'other';

            Log::info("[AutomationEngine] Intent of incoming reply is: '{$intent}'");

            if (in_array($intent, ['unsubscribed', 'book_call'])) {
                foreach ($runningInstances as $instance) {
                    Log::info("[AutomationEngine] Pausing active outreach sequence instance {$instance->id} due to reply intent '{$intent}'");
                    $instance->update(['status' => 'paused']);

                    \App\Models\AutomationRun::create([
                        'instance_id' => $instance->id,
                        'node_id' => $instance->current_node ?: 'reply_pause',
                        'input_payload' => ['email_text' => $emailText, 'intent' => $intent],
                        'output_payload' => ['status' => 'paused_by_reply'],
                        'status' => 'success',
                    ]);
                }
            }
        }
    }
}
