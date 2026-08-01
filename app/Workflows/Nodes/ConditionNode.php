<?php

namespace App\Workflows\Nodes;

use App\Models\AutomationInstance;
use App\Workflows\WorkflowNode;

class ConditionNode implements WorkflowNode
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function execute(AutomationInstance $instance, array $input): array
    {
        $field = $this->config['field'] ?? 'intent';
        $conditions = $this->config['conditions'] ?? [];
        $defaultNext = $this->config['default_next'] ?? null;

        // Extract the value from the previous node's output / input payload
        $val = $input[$field] ?? null;

        $nextNode = $defaultNext;
        $matchedBranch = 'default';

        if ($val !== null && isset($conditions[$val])) {
            $nextNode = $conditions[$val];
            $matchedBranch = $val;
        }

        return [
            'matched_branch' => $matchedBranch,
            'value_evaluated' => $val,
            'next_node' => $nextNode,
        ];
    }
}
