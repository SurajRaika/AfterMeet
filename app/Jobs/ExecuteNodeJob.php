<?php

namespace App\Jobs;

use App\Models\AutomationInstance;
use App\Models\AutomationRun;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExecuteNodeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $instanceId;
    public string $nodeId;
    public array $inputPayload;

    /**
     * Create a new job instance.
     */
    public function __construct(int $instanceId, string $nodeId, array $inputPayload = [])
    {
        $this->instanceId = $instanceId;
        $this->nodeId = $nodeId;
        $this->inputPayload = $inputPayload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $instance = AutomationInstance::find($this->instanceId);
        if (!$instance) {
            Log::error("ExecuteNodeJob: AutomationInstance not found: {$this->instanceId}");
            return;
        }

        // Only execute if instance is active or paused (which is expected when resuming from delay)
        if (!in_array($instance->status, ['active', 'paused'])) {
            Log::info("ExecuteNodeJob: Instance {$instance->id} has status '{$instance->status}'. Skipping execution.");
            return;
        }

        $automation = $instance->automation;
        if (!$automation) {
            $instance->update(['status' => 'failed']);
            Log::error("ExecuteNodeJob: Automation not found for instance {$instance->id}");
            return;
        }

        $definition = $automation->workflow_definition;
        $nodes = $definition['nodes'] ?? [];
        $nodeDef = $nodes[$this->nodeId] ?? null;

        if (!$nodeDef) {
            $instance->update(['status' => 'failed']);
            AutomationRun::create([
                'instance_id' => $instance->id,
                'node_id' => $this->nodeId,
                'input_payload' => $this->inputPayload,
                'output_payload' => null,
                'status' => 'failed',
                'error_message' => "Node '{$this->nodeId}' not found in workflow definition.",
            ]);
            Log::error("ExecuteNodeJob: Node definition not found for '{$this->nodeId}' in automation {$automation->id}");
            return;
        }

        $nodeType = $nodeDef['type'] ?? null;
        $className = "App\\Workflows\\Nodes\\" . $nodeType;

        if (!class_exists($className)) {
            $instance->update(['status' => 'failed']);
            AutomationRun::create([
                'instance_id' => $instance->id,
                'node_id' => $this->nodeId,
                'input_payload' => $this->inputPayload,
                'output_payload' => null,
                'status' => 'failed',
                'error_message' => "Workflow node class '{$className}' not found.",
            ]);
            Log::error("ExecuteNodeJob: Class '{$className}' not found for node {$this->nodeId}");
            return;
        }

        // If currently paused, resume to active status
        if ($instance->status === 'paused' && $nodeType !== 'DelayNode') {
            $instance->update(['status' => 'active']);
        }

        $instance->update(['current_node' => $this->nodeId]);

        try {
            $nodeInstance = new $className($nodeDef['config'] ?? []);
            $outputPayload = $nodeInstance->execute($instance, $this->inputPayload);

            // Handle output of the node
            if (($outputPayload['status'] ?? '') === 'failed') {
                $instance->update(['status' => 'failed']);
                AutomationRun::create([
                    'instance_id' => $instance->id,
                    'node_id' => $this->nodeId,
                    'input_payload' => $this->inputPayload,
                    'output_payload' => $outputPayload,
                    'status' => 'failed',
                    'error_message' => $outputPayload['error'] ?? 'Node execution failed.',
                ]);
                return;
            }

            // Determine next node
            $nextNodeId = null;
            if ($nodeType === 'ConditionNode') {
                $nextNodeId = $outputPayload['next_node'] ?? null;
            } else {
                $nextNodeId = $nodeDef['next'] ?? null;
            }

            if (($outputPayload['status'] ?? '') === 'delayed') {
                // Node handled pausing. We log a delayed/paused execution run.
                AutomationRun::create([
                    'instance_id' => $instance->id,
                    'node_id' => $this->nodeId,
                    'input_payload' => $this->inputPayload,
                    'output_payload' => $outputPayload,
                    'status' => 'delayed/paused',
                ]);

                if ($nextNodeId && $nextNodeId !== 'end') {
                    // Queue next execution with delay
                    $delaySeconds = (int)($outputPayload['delay_seconds'] ?? 0);
                    self::dispatch($instance->id, $nextNodeId, $outputPayload)->delay($delaySeconds);
                } else {
                    $instance->update(['status' => 'completed']);
                }
                return;
            }

            // Standard successful node run
            AutomationRun::create([
                'instance_id' => $instance->id,
                'node_id' => $this->nodeId,
                'input_payload' => $this->inputPayload,
                'output_payload' => $outputPayload,
                'status' => 'success',
            ]);

            if (!$nextNodeId || $nextNodeId === 'end') {
                $instance->update(['status' => 'completed']);
            } else {
                // Dispatch next node sequentially
                self::dispatch($instance->id, $nextNodeId, $outputPayload);
            }

        } catch (\Exception $e) {
            $instance->update(['status' => 'failed']);
            AutomationRun::create([
                'instance_id' => $instance->id,
                'node_id' => $this->nodeId,
                'input_payload' => $this->inputPayload,
                'output_payload' => null,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            Log::error("ExecuteNodeJob exception: " . $e->getMessage(), [
                'exception' => $e
            ]);
        }
    }
}
