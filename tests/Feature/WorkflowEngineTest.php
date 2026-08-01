<?php

use App\Models\User;
use App\Models\Prospect;
use App\Models\Workflow;
use App\Models\WorkflowRun;
use App\Models\WorkflowStepRun;
use App\Workflows\WorkflowExecutor;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'user_' . uniqid() . '_' . rand(1000, 9999) . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('can manage workflows CRUD via controller', function () {
    $this->actingAs($this->user);

    // 1. Create a Workflow
    $graph = [
        'nodes' => [
            ['id' => '1', 'type' => 'enrichment'],
            ['id' => '2', 'type' => 'send_email'],
        ],
        'edges' => [
            ['from' => '1', 'to' => '2'],
        ],
    ];

    $response = $this->post(route('workflows.store'), [
        'name' => 'Outreach flow V1',
        'description' => 'Sequential outreach',
        'trigger_type' => 'manual',
        'graph' => json_encode($graph),
        'is_active' => '1',
    ]);

    $response->assertRedirect(route('workflows.index'));
    $this->assertDatabaseHas('workflows', [
        'name' => 'Outreach flow V1',
        'trigger_type' => 'manual',
        'is_active' => true,
    ]);

    $workflow = Workflow::first();
    expect($workflow->graph)->toBe($graph);

    // 2. Edit / Update Workflow
    $newGraph = [
        'nodes' => [
            ['id' => '1', 'type' => 'enrichment'],
            ['id' => '2', 'type' => 'sales_action'],
        ],
        'edges' => [
            ['from' => '1', 'to' => '2'],
        ],
    ];

    $response = $this->put(route('workflows.update', $workflow->id), [
        'name' => 'Outreach flow V2',
        'description' => 'Updated sequence',
        'trigger_type' => 'prospect_created',
        'graph' => json_encode($newGraph),
        'is_active' => '1',
    ]);

    $response->assertRedirect(route('workflows.index'));
    $this->assertDatabaseHas('workflows', [
        'id' => $workflow->id,
        'name' => 'Outreach flow V2',
        'trigger_type' => 'prospect_created',
    ]);

    // 3. Show Workflow
    $response = $this->get(route('workflows.show', $workflow->id));
    $response->assertStatus(200);
    $response->assertSee('Outreach flow V2');

    // 4. Delete Workflow
    $response = $this->delete(route('workflows.destroy', $workflow->id));
    $response->assertRedirect(route('workflows.index'));
    $this->assertDatabaseMissing('workflows', [
        'id' => $workflow->id,
    ]);
});

it('can execute basic sequential workflow using WorkflowExecutor', function () {
    $graph = [
        'nodes' => [
            ['id' => 'node-1', 'type' => 'enrichment'],
            ['id' => 'node-2', 'type' => 'send_email'],
        ],
        'edges' => [
            ['from' => 'node-1', 'to' => 'node-2'],
        ],
    ];

    $workflow = Workflow::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Sequential Enrichment Flow',
        'trigger_type' => 'manual',
        'graph' => $graph,
        'is_active' => true,
    ]);

    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Acme Inc',
        'contact_name' => 'Jane Smith',
        'contact_email' => 'janesmith@acme.com',
        'status' => 'new',
    ]);

    $executor = new WorkflowExecutor();
    $run = $executor->execute($workflow, [
        'company_name' => 'Acme Inc',
    ], $prospect);

    // Verify Workflow Run logging
    expect($run->status)->toBe('completed');
    expect($run->output['company_size'])->toBe('500');
    expect($run->output['industry'])->toBe('software');
    expect($run->output['sent'])->toBeTrue();

    // Verify step runs exist
    $stepRuns = $run->stepRuns()->orderBy('id')->get();
    expect($stepRuns)->toHaveCount(2);

    expect($stepRuns[0]->node_id)->toBe('node-1');
    expect($stepRuns[0]->node_type)->toBe('enrichment');
    expect($stepRuns[0]->status)->toBe('completed');

    expect($stepRuns[1]->node_id)->toBe('node-2');
    expect($stepRuns[1]->node_type)->toBe('send_email');
    expect($stepRuns[1]->status)->toBe('completed');
});

it('can process conditional branching under ConditionNode', function () {
    // Graph representation:
    // Enrichment (node-1) -> Condition (node-2, e.g. checks if company_size > 100)
    // If true -> Send Email (node-3)
    // If false -> Sales Action (node-4)
    $graph = [
        'nodes' => [
            ['id' => 'node-1', 'type' => 'enrichment'],
            ['id' => 'node-2', 'type' => 'condition'],
            ['id' => 'node-3', 'type' => 'send_email'],
            ['id' => 'node-4', 'type' => 'sales_action'],
        ],
        'edges' => [
            ['from' => 'node-1', 'to' => 'node-2'],
            ['from' => 'node-2', 'to' => 'node-3', 'condition' => 'true'],
            ['from' => 'node-2', 'to' => 'node-4', 'condition' => 'false'],
        ],
    ];

    $workflow = Workflow::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Branching Flow',
        'trigger_type' => 'manual',
        'graph' => $graph,
        'is_active' => true,
    ]);

    // Test Case A: True Branch (default enrichment outputs company_size = 500, which is > 100)
    $executor = new WorkflowExecutor();
    $runA = $executor->execute($workflow, [
        'company_name' => 'Acme',
    ]);

    expect($runA->status)->toBe('completed');
    expect($runA->output['company_size'])->toBe('500');
    expect($runA->output['checked_field'])->toBe('company_size');
    expect($runA->output['result'])->toBeTrue();
    expect($runA->output['sent'])->toBeTrue(); // true branch executed SendEmailNode

    // Step run counts should be 3 (node-1 -> node-2 -> node-3)
    expect($runA->stepRuns)->toHaveCount(3);
    $executedNodeIdsA = $runA->stepRuns->pluck('node_id')->toArray();
    expect($executedNodeIdsA)->toContain('node-1', 'node-2', 'node-3');
    expect($executedNodeIdsA)->not->toContain('node-4');

    // Test Case B: False Branch (custom condition config set to fail)
    $runB = $executor->execute($workflow, [
        'company_name' => 'Acme',
        'condition_field' => 'company_size',
        'condition_operator' => '<', // checks if company_size < 100 (which is false for 500)
        'condition_value' => '100',
    ]);

    expect($runB->status)->toBe('completed');
    expect($runB->output['result'])->toBeFalse();
    expect($runB->output['action_taken'])->toBe('update_stage'); // false branch executed SalesActionNode

    expect($runB->stepRuns)->toHaveCount(3);
    $executedNodeIdsB = $runB->stepRuns->pluck('node_id')->toArray();
    expect($executedNodeIdsB)->toContain('node-1', 'node-2', 'node-4');
    expect($executedNodeIdsB)->not->toContain('node-3');
});

it('can process custom intent detection stages and prompt extra context', function () {
    $graph = [
        'nodes' => [
            [
                'id' => 'node-1',
                'type' => 'intent',
                'properties' => [
                    'stages' => [
                        ['name' => 'book_call', 'description' => 'The prospect wants to schedule a call or meet.'],
                        ['name' => 'not_now', 'description' => 'The prospect is busy or wants to connect later.'],
                    ],
                    'extra_context' => 'Treat schedule requests as high priority',
                ]
            ],
        ],
        'edges' => []
    ];

    $workflow = Workflow::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Intent Stage Flow',
        'trigger_type' => 'manual',
        'graph' => $graph,
        'is_active' => true,
    ]);

    $executor = new WorkflowExecutor();

    // Positive Match Case
    $runA = $executor->execute($workflow, [
        'message' => 'Sure, let us schedule a meet next Tuesday.',
    ]);

    expect($runA->status)->toBe('completed');
    expect($runA->output['intent'])->toBe('book_call');
    expect($runA->output['confidence_score'])->toBe(0.95);
    expect($runA->output['extra_context_applied'])->toBe('Treat schedule requests as high priority');
});
