<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;

class IntentNode implements WorkflowNode
{
    public function execute($input)
    {
        $message = $input['message'] ?? '';

        // Simple simulation of intent analysis
        $intent = 'positive';
        $score = 0.95;

        if (stripos($message, 'stop') !== false || stripos($message, 'unsubscribe') !== false) {
            $intent = 'negative';
            $score = 0.99;
        } elseif (stripos($message, 'later') !== false || stripos($message, 'busy') !== false) {
            $intent = 'neutral';
            $score = 0.75;
        }

        return [
            'intent' => $intent,
            'score' => $score,
            'detected' => true,
        ];
    }
}
