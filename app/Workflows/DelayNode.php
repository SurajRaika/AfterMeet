<?php

namespace App\Workflows;

use App\Models\AutomationInstance;
use App\Jobs\ResumeAutomationInstanceJob;
use Illuminate\Support\Facades\Log;

class DelayNode implements WorkflowNode
{
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array
    {
        $delayDays = $nodeConfig['delay_days'] ?? 3;
        $delaySeconds = $nodeConfig['delay_seconds'] ?? null;

        $seconds = $delaySeconds !== null ? (int)$delaySeconds : ($delayDays * 24 * 3600);

        Log::info("[DelayNode] Pausing automation instance {$instance->id} for {$seconds} seconds.");

        $instance->update([
            'status' => 'paused',
        ]);

        ResumeAutomationInstanceJob::dispatch($instance->id)->delay(now()->addSeconds($seconds));

        return [
            'status' => 'paused',
            'delay_seconds' => $seconds,
            'resumes_at' => now()->addSeconds($seconds)->toDateTimeString(),
        ];
    }
}
