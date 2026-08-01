<?php

namespace App\Workflows;

use App\Models\Automation;
use App\Models\AutomationInstance;
use App\Models\Prospect;
use App\Jobs\ExecuteNodeJob;

class WorkflowEngine
{
    /**
     * Start a new workflow instance for a prospect.
     *
     * @param Automation $automation
     * @param Prospect $prospect
     * @param array $initialInput
     * @return AutomationInstance
     */
    public function start(Automation $automation, Prospect $prospect, array $initialInput = []): AutomationInstance
    {
        $definition = $automation->workflow_definition;
        $startNode = $definition['start_node'] ?? null;

        $instance = AutomationInstance::create([
            'automation_id' => $automation->id,
            'prospect_id' => $prospect->id,
            'status' => 'active',
            'current_node' => $startNode,
            'started_at' => now(),
        ]);

        if ($startNode) {
            ExecuteNodeJob::dispatch($instance->id, $startNode, $initialInput);
        } else {
            $instance->update(['status' => 'completed']);
        }

        return $instance;
    }

    /**
     * Handle trigger on incoming email received.
     *
     * @param Prospect $prospect
     * @param string $emailText
     * @return void
     */
    public function triggerEmailReceived(Prospect $prospect, string $emailText): void
    {
        // Find active automations of type 'trigger' (like Smart Inbox Assistant)
        $automations = Automation::where('is_active', true)
            ->get();

        foreach ($automations as $automation) {
            $this->start($automation, $prospect, [
                'email_text' => $emailText,
                'received_at' => now()->toDateTimeString()
            ]);
        }
    }
}
