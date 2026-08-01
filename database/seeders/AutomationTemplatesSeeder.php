<?php

namespace Database\Seeders;

use App\Models\Automation;
use Illuminate\Database\Seeder;

class AutomationTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $outreachTemplateDef = [
            'start_node_id' => 'send_initial',
            'nodes' => [
                'send_initial' => [
                    'type' => 'SendEmailNode',
                    'config' => [
                        'subject' => 'Quick question regarding {{company_name}}',
                        'body' => "Hi {{contact_name}},\n\nI was looking at {{company_name}} and wanted to connect regarding your role as {{contact_role}}.\n\nDo you have 10 minutes next week to connect?\n\nBest,\nOur Team",
                    ],
                    'next' => 'wait_3_days',
                ],
                'wait_3_days' => [
                    'type' => 'DelayNode',
                    'config' => [
                        'delay_days' => 3,
                    ],
                    'next' => 'check_for_reply',
                ],
                'check_for_reply' => [
                    'type' => 'CheckReplyNode',
                    'config' => [],
                    'next' => 'reply_branch',
                ],
                'reply_branch' => [
                    'type' => 'ConditionNode',
                    'config' => [
                        'field' => 'has_reply',
                        'routes' => [
                            'true' => 'reply_received_end',
                            'false' => 'send_follow_up',
                        ],
                        'default' => 'send_follow_up',
                    ],
                ],
                'send_follow_up' => [
                    'type' => 'SendEmailNode',
                    'config' => [
                        'subject' => 'Following up on my previous note',
                        'body' => "Hi {{contact_name}},\n\nJust wanted to bump this to the top of your inbox. Let me know if you are open to chat.\n\nBest,\nOur Team",
                    ],
                    'next' => null,
                ],
                'reply_received_end' => [
                    'type' => 'UpdateProspectNode',
                    'config' => [
                        'fields' => [
                            'status' => 'active',
                        ],
                    ],
                    'next' => null,
                ],
            ],
        ];

        $smartInboxDef = [
            'start_node_id' => 'run_intent_classifier',
            'nodes' => [
                'run_intent_classifier' => [
                    'type' => 'IntentNode',
                    'config' => [
                        'prompt' => 'Determine if the sender is interested in booking a call or wants to unsubscribe.',
                    ],
                    'next' => 'intent_branch',
                ],
                'intent_branch' => [
                    'type' => 'ConditionNode',
                    'config' => [
                        'field' => 'intent',
                        'routes' => [
                            'book_call' => 'send_calendar_link',
                            'unsubscribed' => 'unsubscribe_and_block',
                        ],
                        'default' => 'other_do_nothing',
                    ],
                ],
                'send_calendar_link' => [
                    'type' => 'SendEmailNode',
                    'config' => [
                        'subject' => "Let's schedule a call!",
                        'body' => "Hi {{contact_name}},\n\nFantastic! I would love to connect. Here is my calendar link to book a time: https://calendly.com/our-team\n\nLooking forward to it!\n\nBest,\nOur Team",
                    ],
                    'next' => null,
                ],
                'unsubscribe_and_block' => [
                    'type' => 'UpdateProspectNode',
                    'config' => [
                        'fields' => [
                            'user_unsubscribed' => true,
                            'status' => 'junk',
                        ],
                    ],
                    'next' => null,
                ],
                'other_do_nothing' => [
                    'type' => 'UpdateProspectNode',
                    'config' => [
                        'fields' => [
                            'status' => 'active',
                        ],
                    ],
                    'next' => null,
                ],
            ],
        ];

        Automation::updateOrCreate(
            ['name' => 'Cold Outreach Sequence', 'is_template' => true],
            [
                'type' => 'action',
                'workflow_definition' => $outreachTemplateDef,
                'is_active' => false,
            ]
        );

        Automation::updateOrCreate(
            ['name' => 'Smart Inbox Assistant', 'is_template' => true],
            [
                'type' => 'trigger',
                'workflow_definition' => $smartInboxDef,
                'is_active' => false,
            ]
        );
    }
}
