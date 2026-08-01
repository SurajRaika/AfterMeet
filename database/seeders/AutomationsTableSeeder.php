<?php

namespace Database\Seeders;

use App\Models\Automation;
use Illuminate\Database\Seeder;

class AutomationsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Template 1: Cold Outreach Sequence
        Automation::updateOrCreate(
            ['name' => 'Cold Outreach Sequence'],
            [
                'type' => 'action',
                'is_active' => true,
                'workflow_definition' => [
                    'start_node' => 'node_send_email_1',
                    'nodes' => [
                        'node_send_email_1' => [
                            'type' => 'SendEmailNode',
                            'config' => [
                                'subject' => 'Quick question regarding {{company_name}}',
                                'body' => "Hi {{contact_name}},\n\nI noticed your role as {{contact_role}} at {{company_name}}. I wanted to ask if you've thought about automating your sales workflows?\n\nBest,\nSales Team",
                            ],
                            'next' => 'node_delay_3_days',
                        ],
                        'node_delay_3_days' => [
                            'type' => 'DelayNode',
                            'config' => [
                                'days' => 3,
                            ],
                            'next' => 'node_send_followup',
                        ],
                        'node_send_followup' => [
                            'type' => 'SendEmailNode',
                            'config' => [
                                'subject' => 'Following up on my previous message',
                                'body' => "Hi {{contact_name}},\n\nJust wanted to bump this to the top of your inbox. Let me know if you have 5 minutes to connect.\n\nBest,\nSales Team",
                            ],
                            'next' => 'end',
                        ],
                    ],
                ],
            ]
        );

        // Template 2: Smart Inbox Assistant
        Automation::updateOrCreate(
            ['name' => 'Smart Inbox Assistant'],
            [
                'type' => 'trigger',
                'is_active' => true,
                'workflow_definition' => [
                    'start_node' => 'node_run_intent',
                    'nodes' => [
                        'node_run_intent' => [
                            'type' => 'IntentNode',
                            'config' => [],
                            'next' => 'node_condition',
                        ],
                        'node_condition' => [
                            'type' => 'ConditionNode',
                            'config' => [
                                'field' => 'intent',
                                'conditions' => [
                                    'book_call' => 'node_send_calendar_link',
                                    'unsubscribed' => 'node_update_status_blocked',
                                ],
                                'default_next' => 'end',
                            ],
                            'next' => null,
                        ],
                        'node_send_calendar_link' => [
                            'type' => 'SendEmailNode',
                            'config' => [
                                'subject' => "Let's schedule a call!",
                                'body' => "Hi {{contact_name}},\n\nAwesome! Here is my calendar link to book a time: https://calendly.com/wave-ai/15min.\n\nLooking forward to it!\nSales Team",
                            ],
                            'next' => 'end',
                        ],
                        'node_update_status_blocked' => [
                            'type' => 'UpdateProspectStatusNode',
                            'config' => [
                                'status' => 'Blocked',
                                'stage' => 'Archived',
                            ],
                            'next' => 'end',
                        ],
                    ],
                ],
            ]
        );
    }
}
