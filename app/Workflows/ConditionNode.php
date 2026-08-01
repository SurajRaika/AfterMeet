<?php

namespace App\Workflows;

use App\Models\AutomationInstance;
use Illuminate\Support\Facades\Log;

class ConditionNode implements WorkflowNode
{
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array
    {
        $field = $nodeConfig['field'] ?? 'intent';
        $val = $inputData[$field] ?? null;

        Log::info("[ConditionNode] Evaluating branching condition for field '{$field}' with value '{$val}'.");

        $routes = $nodeConfig['routes'] ?? [];
        $nextNodeId = null;

        if ($val !== null && isset($routes[$val])) {
            $nextNodeId = $routes[$val];
            Log::info("[ConditionNode] Match found. Routing to node '{$nextNodeId}'.");
        } else {
            $nextNodeId = $nodeConfig['default'] ?? null;
            Log::info("[ConditionNode] No match found. Routing to default node '{$nextNodeId}'.");
        }

        return [
            'next_node_id' => $nextNodeId,
            'matched_value' => $val,
        ];
    }
}
