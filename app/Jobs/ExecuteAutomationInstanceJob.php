<?php

namespace App\Jobs;

use App\Models\AutomationInstance;
use App\Services\AutomationEngine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExecuteAutomationInstanceJob implements ShouldQueue
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
    public function handle(AutomationEngine $engine): void
    {
        Log::info("[ExecuteAutomationInstanceJob] Starting job for instance ID {$this->instanceId}, node ID {$this->nodeId}");

        $instance = AutomationInstance::find($this->instanceId);

        if (!$instance) {
            Log::warning("[ExecuteAutomationInstanceJob] AutomationInstance with ID {$this->instanceId} not found.");
            return;
        }

        $engine->executeStep($instance, $this->nodeId, $this->inputPayload);
    }
}
