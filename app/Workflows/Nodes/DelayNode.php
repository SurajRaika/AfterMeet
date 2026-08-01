<?php

namespace App\Workflows\Nodes;

use App\Models\AutomationInstance;
use App\Workflows\WorkflowNode;

class DelayNode implements WorkflowNode
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function execute(AutomationInstance $instance, array $input): array
    {
        $seconds = (int)($this->config['seconds'] ?? 0);
        $days = (int)($this->config['days'] ?? 0);

        $delaySeconds = $seconds ?: ($days * 86400);

        // Transition instance to paused
        $instance->update(['status' => 'paused']);

        $resumeAt = now()->addSeconds($delaySeconds);

        return [
            'status' => 'delayed',
            'delay_seconds' => $delaySeconds,
            'resume_at' => $resumeAt->toDateTimeString(),
        ];
    }
}
