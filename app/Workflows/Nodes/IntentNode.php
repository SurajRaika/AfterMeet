<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;
use Illuminate\Support\Str;

class IntentNode implements WorkflowNode
{
    public function execute($input)
    {
        $message = $input['message'] ?? $input['email_body'] ?? '';

        // Retrieve stages and extra context from the node's properties
        // The properties are stored inside the node's properties in the graph, and the executor merges them into the input context
        $stages = $input['stages'] ?? [
            ['name' => 'positive', 'description' => 'Prospect shows positive interest or wants to connect.'],
            ['name' => 'negative', 'description' => 'Prospect declined, said stop, or unsubscribe.'],
            ['name' => 'neutral', 'description' => 'Automated, out of office, or indifferent replies.'],
        ];

        $extraContext = $input['extra_context'] ?? '';

        // Simulate AI-based categorization using the custom stage descriptions
        $detectedIntent = 'neutral';
        $highestScore = 0.5;

        // Simple high-fidelity rule matching based on stage descriptions and message contents
        $messageLower = strtolower($message);

        foreach ($stages as $stage) {
            $name = $stage['name'] ?? 'neutral';
            $desc = strtolower($stage['description'] ?? '');

            // Positive indicators
            if (Str::contains($desc, ['positive', 'interest', 'connect', 'call', 'meeting'])) {
                if (Str::contains($messageLower, ['yes', 'sure', 'interested', 'call', 'meet', 'schedule', 'demo', 'sounds good', 'great'])) {
                    $detectedIntent = $name;
                    $highestScore = 0.95;
                    break;
                }
            }

            // Negative indicators
            if (Str::contains($desc, ['declined', 'stop', 'unsubscribe', 'no', 'negative'])) {
                if (Str::contains($messageLower, ['stop', 'unsubscribe', 'no ', 'not interested', 'remove', 'dont contact'])) {
                    $detectedIntent = $name;
                    $highestScore = 0.99;
                    break;
                }
            }

            // Out of office / Neutral indicators
            if (Str::contains($desc, ['office', 'neutral', 'auto', 'vacation'])) {
                if (Str::contains($messageLower, ['out of office', 'vacation', 'automatic reply', 're:'])) {
                    $detectedIntent = $name;
                    $highestScore = 0.85;
                }
            }
        }

        // Fallback: if no active matches but stages are present, assign first stage as fallback or neutral
        if ($detectedIntent === 'neutral' && !empty($stages) && $highestScore === 0.5) {
            $detectedIntent = $stages[0]['name'] ?? 'neutral';
            $highestScore = 0.70;
        }

        return [
            'intent' => $detectedIntent,
            'confidence_score' => $highestScore,
            'stages_evaluated' => $stages,
            'extra_context_applied' => $extraContext,
            'detected' => true,
        ];
    }
}
