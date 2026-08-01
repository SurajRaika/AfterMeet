<?php

namespace Tests\Feature;

use App\Models\Automation;
use App\Models\AutomationInstance;
use App\Models\AutomationRun;
use App\Models\Prospect;
use App\Models\NylasAccount;
use App\Models\User;
use App\Services\AutomationEngine;
use App\Jobs\SyncNewEmailJob;
use App\Jobs\ExecuteAutomationInstanceJob;
use App\Jobs\ResumeAutomationInstanceJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AutomationEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected NylasAccount $nylasAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'id' => 99,
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'username' => 'testuser',
            'password' => bcrypt('password'),
        ]);

        $this->nylasAccount = NylasAccount::create([
            'user_id' => $this->user->id,
            'grant_id' => 'test-grant-123',
            'email' => 'testuser@example.com',
        ]);
    }

    /**
     * Test 1: Unsubscribe flow E2E.
     */
    public function test_unsubscribe_flow_updates_prospect_to_unsubscribed_and_junk(): void
    {
        Queue::fake([
            ExecuteAutomationInstanceJob::class,
            ResumeAutomationInstanceJob::class,
        ]);

        $prospect = Prospect::create([
            'tenant_id' => $this->user->id,
            'company_name' => 'Hooli Corp',
            'contact_name' => 'Richard Hendricks',
            'contact_email' => 'richard@hooli.com',
            'status' => 'active',
            'user_unsubscribed' => false,
        ]);

        $smartInboxDef = [
            'start_node_id' => 'run_intent_classifier',
            'nodes' => [
                'run_intent_classifier' => [
                    'type' => 'IntentNode',
                    'config' => [
                        'prompt' => 'Check if the sender wants to unsubscribe or book a call.',
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
                        'body' => 'Here is my link: https://calendly.com/test',
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

        $automation = Automation::create([
            'tenant_id' => $this->user->id,
            'name' => 'Smart Inbox Assistant',
            'type' => 'trigger',
            'workflow_definition' => $smartInboxDef,
            'is_active' => true,
        ]);

        Http::fake([
            'https://api.us.nylas.com/v3/grants/test-grant-123/messages/msg-xyz-999' => Http::response([
                'data' => [
                    'id' => 'msg-xyz-999',
                    'thread_id' => 'thread-xyz-999',
                    'subject' => 'Please remove me from this list',
                    'body' => 'Hi, please stop emailing me and remove me from this list immediately.',
                    'snippet' => 'Please remove me from this list',
                    'from' => [
                        ['email' => 'richard@hooli.com', 'name' => 'Richard Hendricks']
                    ],
                    'date' => time(),
                    'unread' => true,
                ]
            ], 200)
        ]);

        SyncNewEmailJob::dispatchSync('test-grant-123', 'msg-xyz-999');

        $instance = AutomationInstance::where('prospect_id', $prospect->id)
            ->where('automation_id', $automation->id)
            ->first();

        $this->assertNotNull($instance);

        $runJob1 = new ExecuteAutomationInstanceJob($instance->id, 'run_intent_classifier', [
            'email_text' => 'Hi, please stop emailing me and remove me from this list immediately.',
        ]);
        $runJob1->handle(new AutomationEngine());

        $intentRun = AutomationRun::where('instance_id', $instance->id)->where('node_id', 'run_intent_classifier')->first();
        $this->assertNotNull($intentRun);
        $this->assertEquals('success', $intentRun->status);
        $this->assertEquals('unsubscribed', $intentRun->output_payload['intent'] ?? '');

        $runJob2 = new ExecuteAutomationInstanceJob($instance->id, 'intent_branch', $intentRun->output_payload);
        $runJob2->handle(new AutomationEngine());

        $branchRun = AutomationRun::where('instance_id', $instance->id)->where('node_id', 'intent_branch')->first();
        $this->assertNotNull($branchRun);
        $this->assertEquals('unsubscribe_and_block', $branchRun->output_payload['next_node_id'] ?? '');

        $runJob3 = new ExecuteAutomationInstanceJob($instance->id, 'unsubscribe_and_block', $branchRun->output_payload);
        $runJob3->handle(new AutomationEngine());

        $prospect->refresh();
        $this->assertTrue((bool)$prospect->user_unsubscribed);
        $this->assertEquals('junk', $prospect->status);

        $instance->refresh();
        $this->assertEquals('completed', $instance->status);
    }

    /**
     * Test 2: Booking flow E2E.
     */
    public function test_booking_flow_sends_calendar_link(): void
    {
        Queue::fake([
            ExecuteAutomationInstanceJob::class,
            ResumeAutomationInstanceJob::class,
        ]);

        $prospect = Prospect::create([
            'tenant_id' => $this->user->id,
            'company_name' => 'Hooli Corp',
            'contact_name' => 'Richard Hendricks',
            'contact_email' => 'richard@hooli.com',
            'status' => 'active',
            'user_unsubscribed' => false,
        ]);

        $smartInboxDef = [
            'start_node_id' => 'run_intent_classifier',
            'nodes' => [
                'run_intent_classifier' => [
                    'type' => 'IntentNode',
                    'config' => [
                        'prompt' => 'Check if the sender wants to unsubscribe or book a call.',
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
                        'body' => 'Here is my link: https://calendly.com/test',
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

        $automation = Automation::create([
            'tenant_id' => $this->user->id,
            'name' => 'Smart Inbox Assistant',
            'type' => 'trigger',
            'workflow_definition' => $smartInboxDef,
            'is_active' => true,
        ]);

        Http::fake([
            'https://api.us.nylas.com/v3/grants/test-grant-123/messages/msg-xyz-555' => Http::response([
                'data' => [
                    'id' => 'msg-xyz-555',
                    'thread_id' => 'thread-xyz-555',
                    'subject' => 'Can we talk on Friday?',
                    'body' => 'Hey, I loved your product. Can we talk on Friday?',
                    'snippet' => 'Can we talk on Friday?',
                    'from' => [
                        ['email' => 'richard@hooli.com', 'name' => 'Richard Hendricks']
                    ],
                    'date' => time(),
                    'unread' => true,
                ]
            ], 200),
            'https://api.us.nylas.com/v3/grants/test-grant-123/messages/send' => Http::response([
                'data' => [
                    'id' => 'sent-msg-999',
                    'subject' => "Let's schedule a call!",
                ]
            ], 200)
        ]);

        SyncNewEmailJob::dispatchSync('test-grant-123', 'msg-xyz-555');

        $instance = AutomationInstance::where('prospect_id', $prospect->id)
            ->where('automation_id', $automation->id)
            ->first();

        $this->assertNotNull($instance);

        $runJob1 = new ExecuteAutomationInstanceJob($instance->id, 'run_intent_classifier', [
            'email_text' => 'Hey, I loved your product. Can we talk on Friday?',
        ]);
        $runJob1->handle(new AutomationEngine());

        $intentRun = AutomationRun::where('instance_id', $instance->id)->where('node_id', 'run_intent_classifier')->first();
        $this->assertEquals('book_call', $intentRun->output_payload['intent'] ?? '');

        $runJob2 = new ExecuteAutomationInstanceJob($instance->id, 'intent_branch', $intentRun->output_payload);
        $runJob2->handle(new AutomationEngine());

        $branchRun = AutomationRun::where('instance_id', $instance->id)->where('node_id', 'intent_branch')->first();
        $this->assertEquals('send_calendar_link', $branchRun->output_payload['next_node_id'] ?? '');

        $runJob3 = new ExecuteAutomationInstanceJob($instance->id, 'send_calendar_link', $branchRun->output_payload);
        $runJob3->handle(new AutomationEngine());

        Http::assertSent(function($request) {
            return $request->url() === 'https://api.us.nylas.com/v3/grants/test-grant-123/messages/send' &&
                   str_contains($request->body(), "Let's schedule a call!");
        });

        $prospect->refresh();
        $this->assertFalse((bool)$prospect->user_unsubscribed);
        $this->assertEquals('active', $prospect->status);

        $instance->refresh();
        $this->assertEquals('completed', $instance->status);
    }

    /**
     * Test DelayNode and queue-driven resuming.
     */
    public function test_delay_node_suspends_and_resumes(): void
    {
        Queue::fake([
            ExecuteAutomationInstanceJob::class,
            ResumeAutomationInstanceJob::class,
        ]);

        $prospect = Prospect::create([
            'tenant_id' => $this->user->id,
            'company_name' => 'Initech Corp',
            'contact_name' => 'Peter Gibbons',
            'contact_email' => 'peter@initech.com',
            'status' => 'active',
        ]);

        $outreachDef = [
            'start_node_id' => 'send_initial',
            'nodes' => [
                'send_initial' => [
                    'type' => 'SendEmailNode',
                    'config' => [
                        'subject' => 'Quick hello',
                        'body' => 'Hello',
                    ],
                    'next' => 'wait_step',
                ],
                'wait_step' => [
                    'type' => 'DelayNode',
                    'config' => [
                        'delay_seconds' => 5,
                    ],
                    'next' => 'send_followup',
                ],
                'send_followup' => [
                    'type' => 'SendEmailNode',
                    'config' => [
                        'subject' => 'Quick follow up',
                        'body' => 'Just following up',
                    ],
                    'next' => null,
                ],
            ],
        ];

        $automation = Automation::create([
            'tenant_id' => $this->user->id,
            'name' => 'Outreach Delay Flow',
            'type' => 'action',
            'workflow_definition' => $outreachDef,
            'is_active' => true,
        ]);

        Http::fake([
            'https://api.us.nylas.com/v3/grants/test-grant-123/messages/send' => Http::response([
                'data' => ['id' => 'outbound-111']
            ], 200)
        ]);

        $engine = new AutomationEngine();
        $instance = $engine->start($automation, $prospect);

        $this->assertNotNull($instance);

        $runJob1 = new ExecuteAutomationInstanceJob($instance->id, 'send_initial', []);
        $runJob1->handle($engine);

        $runJob2 = new ExecuteAutomationInstanceJob($instance->id, 'wait_step', []);
        $runJob2->handle($engine);

        $instance->refresh();
        $this->assertEquals('paused', $instance->status);
        $this->assertEquals('wait_step', $instance->current_node);

        $resumeJob = new ResumeAutomationInstanceJob($instance->id);
        $resumeJob->handle();

        $instance->refresh();
        $this->assertEquals('active', $instance->status);

        $runJob3 = new ExecuteAutomationInstanceJob($instance->id, 'send_followup', []);
        $runJob3->handle($engine);

        $instance->refresh();
        $this->assertEquals('completed', $instance->status);
        $this->assertEquals('send_followup', $instance->current_node);
    }
}
