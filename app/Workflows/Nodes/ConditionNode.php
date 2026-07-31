<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;

class ConditionNode implements WorkflowNode
{
    public function execute($input)
    {
        $field = $input['condition_field'] ?? 'company_size';
        $operator = $input['condition_operator'] ?? '>';
        $value = $input['condition_value'] ?? '100';

        $actualValue = $input[$field] ?? null;

        $result = false;

        if ($actualValue !== null) {
            switch ($operator) {
                case '>':
                    $result = (float)$actualValue > (float)$value;
                    break;
                case '<':
                    $result = (float)$actualValue < (float)$value;
                    break;
                case '==':
                case '=':
                    $result = (string)$actualValue == (string)$value;
                    break;
                case '!=':
                    $result = (string)$actualValue != (string)$value;
                    break;
                case 'contains':
                    $result = str_contains((string)$actualValue, (string)$value);
                    break;
            }
        } else {
            // Fallback default rules for easier execution/demo
            if (isset($input['company_size'])) {
                $result = (int)$input['company_size'] > 100;
            } elseif (isset($input['intent'])) {
                $result = $input['intent'] === 'positive';
            }
        }

        return [
            'result' => $result,
            'checked_field' => $field,
            'actual_value' => $actualValue,
        ];
    }
}
