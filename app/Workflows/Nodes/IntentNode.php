<?php

namespace App\Workflows\Nodes;

use App\Models\AutomationInstance;
use App\Workflows\WorkflowNode;
use Illuminate\Support\Facades\Log;

class IntentNode implements WorkflowNode
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function execute(AutomationInstance $instance, array $input): array
    {
        $emailText = $input['email_text'] ?? $input['body'] ?? $input['text'] ?? '';

        $systemPrompt = "You are a highly accurate B2B incoming email intent classification model. " .
                        "Analyze the incoming email text and determine the intent based on these strict stages:\n" .
                        "- 'unsubscribed': User requests to be removed, opted out, stop emailing, or unsubscribed.\n" .
                        "- 'book_call': User wants to meet, schedule a call, chat on a specific day, asks for a calendar link, or is interested in talking.\n" .
                        "- 'general_reply': Any other general questions or replies.\n\n" .
                        "Return ONLY a valid JSON object matching this structure: {\"intent\": \"category\"}.\n" .
                        "Do not include any other markdown formatting, code block markers, or conversational fluff.";

        $userPrompt = "INCOMING EMAIL TEXT:\n" . $emailText;

        try {
            if (config('ai.providers.gemini.key') || config('ai.providers.openai.key')) {
                $aiResponse = \Laravel\Ai\Facades\Ai::text($userPrompt, [
                    'system' => $systemPrompt
                ]);

                $responseString = trim((string)$aiResponse);
                // Strip possible markdown JSON blocks if the model didn't obey
                if (preg_match('/\{.*\}/s', $responseString, $matches)) {
                    $responseString = $matches[0];
                }

                $data = json_decode($responseString, true);
                if ($data && isset($data['intent'])) {
                    return [
                        'intent' => $data['intent']
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning("Laravel AI SDK failed in IntentNode, running keyword fallback: " . $e->getMessage());
        }

        // Rule-based Keyword fallback analyzer
        $lowerText = strtolower($emailText);

        $unsubscribeKeywords = [
            'unsubscribe', 'remove', 'remove me', 'opt out', 'stop', 'please stop',
            'don\'t email', 'delete my', 'cancel subscription', 'lose my email',
            'unsub'
        ];

        $bookCallKeywords = [
            'talk', 'call', 'meet', 'friday', 'monday', 'tuesday', 'wednesday', 'thursday',
            'schedule', 'zoom', 'calendar', 'google meet', 'appointment', 'discuss',
            'time to chat', 'demo'
        ];

        foreach ($unsubscribeKeywords as $kw) {
            if (str_contains($lowerText, $kw)) {
                return ['intent' => 'unsubscribed'];
            }
        }

        foreach ($bookCallKeywords as $kw) {
            if (str_contains($lowerText, $kw)) {
                return ['intent' => 'book_call'];
            }
        }

        return ['intent' => 'general_reply'];
    }
}
