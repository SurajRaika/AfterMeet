<?php

namespace App\Workflows;

use App\Models\AutomationInstance;
use Illuminate\Support\Facades\Log;

class IntentNode implements WorkflowNode
{
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array
    {
        $emailText = $inputData['email_text'] ?? $inputData['body'] ?? '';

        Log::info("[IntentNode] Classifying intent for incoming email text.", [
            'email_text_snippet' => substr($emailText, 0, 100),
        ]);

        $systemPrompt = "You are a world-class inbound email intent classifier.\n" .
                        "Your goal is to parse the recipient's email response and classify their intent into exactly one of the defined intent options.\n\n" .
                        "Your options are:\n" .
                        "- 'unsubscribed': Recipient wants to unsubscribe, stop receiving emails, be removed, or opt out.\n" .
                        "- 'book_call': Recipient is interested, wants to talk, meet, book a call, has questions, or suggests a date/time.\n" .
                        "- 'other': Any other response.\n\n" .
                        "CRITICAL: Return ONLY a valid JSON object matching this exact structure:\n" .
                        "{\n" .
                        "  \"intent\": \"unsubscribed\" or \"book_call\" or \"other\"\n" .
                        "}";

        $userPrompt = "Please classify this email text:\n\n{$emailText}";

        try {
            if (config('ai.providers.gemini.key') || config('ai.providers.openai.key')) {
                $aiResponse = \Laravel\Ai\Facades\Ai::text($userPrompt, [
                    'system' => $systemPrompt
                ]);

                $data = json_decode((string)$aiResponse, true);
                if ($data && isset($data['intent'])) {
                    $intent = strtolower(trim($data['intent']));
                    Log::info("[IntentNode] Classified via Laravel AI SDK: {$intent}");
                    return [
                        'intent' => $intent,
                        'source' => 'ai'
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning("[IntentNode] Laravel AI SDK failed: " . $e->getMessage());
        }

        $intent = 'other';
        $normalizedText = strtolower($emailText);

        $unsubscribeKeywords = ['remove', 'unsubscribe', 'stop', 'take me off', 'opt out', 'unsub', 'leave me alone'];
        $bookCallKeywords = ['talk', 'friday', 'call', 'meet', 'calendar', 'schedule', 'zoom', 'appointment', 'discussion', 'monday', 'tuesday', 'wednesday', 'thursday', 'weekend'];

        foreach ($unsubscribeKeywords as $keyword) {
            if (str_contains($normalizedText, $keyword)) {
                $intent = 'unsubscribed';
                break;
            }
        }

        if ($intent === 'other') {
            foreach ($bookCallKeywords as $keyword) {
                if (str_contains($normalizedText, $keyword)) {
                    $intent = 'book_call';
                    break;
                }
            }
        }

        Log::info("[IntentNode] Classified via local fallback keyword engine: {$intent}");

        return [
            'intent' => $intent,
            'source' => 'fallback'
        ];
    }
}
