<?php

namespace App\Jobs;

use App\Models\AutomationInstance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ResumeAutomationInstanceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $instanceId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $instanceId)
    {
        $this->instanceId = $instanceId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("[ResumeAutomationInstanceJob] Attempting to resume instance {$this->instanceId}");

        $instance = AutomationInstance::find($this->instanceId);

        if (!$instance) {
            Log::warning("[ResumeAutomationInstanceJob] Instance {$this->instanceId} not found.");
            return;
        }

        if ($instance->status !== 'paused') {
            Log::warning("[ResumeAutomationInstanceJob] Skipping resume. Instance {$this->instanceId} status is '{$instance->status}', expected 'paused'");
            return;
        }

        $currentNodeId = $instance->current_node;
        if (empty($currentNodeId)) {
            Log::warning("[ResumeAutomationInstanceJob] No current node set for instance {$this->instanceId} to resume from.");
            return;
        }

        $definition = $instance->automation->workflow_definition;
        $nodes = $definition['nodes'] ?? [];
        $currentNodeConfig = $nodes[$currentNodeId] ?? null;

        if (!$currentNodeConfig) {
            Log::warning("[ResumeAutomationInstanceJob] Node config not found for current node ID '{$currentNodeId}'");
            return;
        }

        $nextNodeId = $currentNodeConfig['next'] ?? null;

        if ($nextNodeId) {
            Log::info("[ResumeAutomationInstanceJob] Advancing instance {$this->instanceId} to next node '{$nextNodeId}'");
            $instance->update(['status' => 'active']);
            ExecuteAutomationInstanceJob::dispatch($instance->id, $nextNodeId, ['resumed' => true]);
        } else {
            Log::info("[ResumeAutomationInstanceJob] No next node after '{$currentNodeId}'. Completing instance {$this->instanceId}");
            $instance->update(['status' => 'completed']);
        }
    }
}
