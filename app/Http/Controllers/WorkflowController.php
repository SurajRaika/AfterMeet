<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Models\WorkflowRun;
use App\Models\Prospect;
use App\Workflows\WorkflowExecutor;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    /**
     * Display a listing of the workflows.
     */
    public function index()
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $workflows = Workflow::where('tenant_id', $tenantId)->latest()->get();

        return view('theme::dashboard.workflows.index', compact('workflows'));
    }

    /**
     * Show the form for creating a new workflow.
     */
    public function create()
    {
        // Provide a beautiful default graph JSON
        $defaultGraph = json_encode([
            'nodes' => [
                [
                    'id' => '1',
                    'type' => 'enrichment',
                    'label' => 'AI Enrichment',
                ],
                [
                    'id' => '2',
                    'type' => 'send_email',
                    'label' => 'First Outreach Email',
                    'properties' => [
                        'subject' => 'Quick question for {{contact_name}}',
                        'body' => 'Hi {{contact_name}}, is {{company_name}} looking for a solution?'
                    ]
                ],
                [
                    'id' => '3',
                    'type' => 'intent',
                    'label' => 'Reply Intent Analysis',
                    'properties' => [
                        'stages' => [
                            ['name' => 'book_call', 'description' => 'Prospect is interested and wants to schedule a call or meet.'],
                            ['name' => 'not_now', 'description' => 'Prospect is busy, out of office, or wants to connect later.'],
                            ['name' => 'unsubscribed', 'description' => 'Prospect declined, said stop, or unsubscribe.']
                        ],
                        'extra_context' => 'Identify direct action requests like schedule/meeting as book_call'
                    ]
                ],
                [
                    'id' => '4',
                    'type' => 'sales_action',
                    'label' => 'Mark as Converted',
                    'properties' => [
                        'action_type' => 'update_stage',
                        'stage' => 'Converted'
                    ]
                ],
                [
                    'id' => '5',
                    'type' => 'send_email',
                    'label' => 'Send Follow-up Email',
                    'properties' => [
                        'subject' => 'Follow up with {{contact_name}}',
                        'body' => 'Hi {{contact_name}}, following up on our last message!'
                    ]
                ],
                [
                    'id' => '6',
                    'type' => 'sales_action',
                    'label' => 'Mark as Junk/Paused',
                    'properties' => [
                        'action_type' => 'update_status',
                        'status' => 'paused'
                    ]
                ]
            ],
            'edges' => [
                ['from' => '1', 'to' => '2'],
                ['from' => '2', 'to' => '3'],
                ['from' => '3', 'to' => '4', 'condition' => 'book_call'],
                ['from' => '3', 'to' => '5', 'condition' => 'not_now'],
                ['from' => '3', 'to' => '6', 'condition' => 'unsubscribed']
            ]
        ], JSON_PRETTY_PRINT);

        return view('theme::dashboard.workflows.create', compact('defaultGraph'));
    }

    /**
     * Store a newly created workflow.
     */
    public function store(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|string|max:50',
            'graph' => 'required|json',
        ]);

        Workflow::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'description' => $request->description,
            'trigger_type' => $request->trigger_type,
            'graph' => json_decode($request->graph, true),
            'is_active' => $request->has('is_active'),
        ]);

        return redirect()->route('workflows.index')->with('success', 'Workflow created successfully.');
    }

    /**
     * Display the specified workflow.
     */
    public function show($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $workflow = Workflow::where('tenant_id', $tenantId)->findOrFail($id);
        $runs = WorkflowRun::where('workflow_id', $workflow->id)->with('prospect')->latest()->get();
        $prospects = Prospect::where('tenant_id', $tenantId)->get();

        return view('theme::dashboard.workflows.show', compact('workflow', 'runs', 'prospects'));
    }

    /**
     * Show the form for editing the workflow.
     */
    public function edit($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $workflow = Workflow::where('tenant_id', $tenantId)->findOrFail($id);
        $graphJson = json_encode($workflow->graph, JSON_PRETTY_PRINT);

        return view('theme::dashboard.workflows.edit', compact('workflow', 'graphJson'));
    }

    /**
     * Update the workflow.
     */
    public function update(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $workflow = Workflow::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|string|max:50',
            'graph' => 'required|json',
        ]);

        $workflow->update([
            'name' => $request->name,
            'description' => $request->description,
            'trigger_type' => $request->trigger_type,
            'graph' => json_decode($request->graph, true),
            'is_active' => $request->has('is_active'),
        ]);

        return redirect()->route('workflows.index')->with('success', 'Workflow updated successfully.');
    }

    /**
     * Remove the workflow.
     */
    public function destroy($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $workflow = Workflow::where('tenant_id', $tenantId)->findOrFail($id);
        $workflow->delete();

        return redirect()->route('workflows.index')->with('success', 'Workflow deleted successfully.');
    }

    /**
     * Execute the workflow manually.
     */
    public function execute(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $workflow = Workflow::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'prospect_id' => 'nullable|exists:prospects,id',
            'custom_input' => 'nullable|json',
        ]);

        $prospect = null;
        if ($request->prospect_id) {
            $prospect = Prospect::where('tenant_id', $tenantId)->find($request->prospect_id);
        }

        $input = [];
        if ($request->custom_input) {
            $input = json_decode($request->custom_input, true);
        }

        // If prospect selected, prefill input context from prospect
        if ($prospect) {
            $input = array_merge([
                'prospect_id' => $prospect->id,
                'company_name' => $prospect->company_name,
                'contact_name' => $prospect->contact_name,
                'contact_email' => $prospect->contact_email,
                'contact_role' => $prospect->contact_role,
                'company_size' => $prospect->company_size,
                'stage' => $prospect->stage,
            ], $input);
        }

        $executor = new WorkflowExecutor();
        $run = $executor->execute($workflow, $input, $prospect);

        if ($run->status === 'failed') {
            return redirect()->route('workflows.show', $workflow->id)
                ->with('error', 'Workflow execution failed: ' . $run->error_message);
        }

        return redirect()->route('workflows.showRun', $run->id)
            ->with('success', 'Workflow executed successfully.');
    }

    /**
     * Display a specific workflow run execution details.
     */
    public function showRun($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $run = WorkflowRun::where('tenant_id', $tenantId)->with(['workflow', 'stepRuns', 'prospect'])->findOrFail($id);

        return view('theme::dashboard.workflows.run_details', compact('run'));
    }

    /**
     * Display the pre-packaged automation templates index.
     */
    public function templatesIndex()
    {
        $templates = [
            [
                'id' => 'ai_smart_inbox_assistant',
                'name' => 'AI Smart Inbox Assistant',
                'description' => 'Automatically scans incoming emails, classifies reply intent (Positive/Book Call, Negative/Unsubscribed, Neutral/Later), and executes immediate smart actions like auto-sending scheduler links or pausing contacts.',
                'trigger_type' => 'email_event',
                'icon' => 'phosphor-brain-duotone',
                'badge' => 'Certified & Verified',
                'actions' => ['AI Enrichment', 'Reply Intent Detection', 'Smart Email Reply', 'CRM Stage Auto-Update'],
            ]
        ];

        return view('theme::dashboard.workflows.templates', compact('templates'));
    }

    /**
     * Deploy a pre-packaged automation template into the user's active workflows.
     */
    public function deployTemplate(Request $request, $templateId)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        if ($templateId !== 'ai_smart_inbox_assistant') {
            return redirect()->back()->with('error', 'Unknown automation template.');
        }

        $graph = [
            'nodes' => [
                [
                    'id' => '1',
                    'type' => 'enrichment',
                    'label' => 'AI Enrichment',
                ],
                [
                    'id' => '2',
                    'type' => 'send_email',
                    'label' => 'First Outreach Email',
                    'properties' => [
                        'subject' => 'Quick question for {{contact_name}}',
                        'body' => 'Hi {{contact_name}}, is {{company_name}} looking for a solution?'
                    ]
                ],
                [
                    'id' => '3',
                    'type' => 'intent',
                    'label' => 'Reply Intent Analysis',
                    'properties' => [
                        'stages' => [
                            ['name' => 'book_call', 'description' => 'Prospect is interested and wants to schedule a call or meet.'],
                            ['name' => 'not_now', 'description' => 'Prospect is busy, out of office, or wants to connect later.'],
                            ['name' => 'unsubscribed', 'description' => 'Prospect declined, said stop, or unsubscribe.']
                        ],
                        'extra_context' => 'Identify direct action requests like schedule/meeting as book_call'
                    ]
                ],
                [
                    'id' => '4',
                    'type' => 'sales_action',
                    'label' => 'Mark as Converted',
                    'properties' => [
                        'action_type' => 'update_stage',
                        'stage' => 'Converted'
                    ]
                ],
                [
                    'id' => '5',
                    'type' => 'send_email',
                    'label' => 'Send Follow-up Email',
                    'properties' => [
                        'subject' => 'Follow up with {{contact_name}}',
                        'body' => 'Hi {{contact_name}}, following up on our last message!'
                    ]
                ],
                [
                    'id' => '6',
                    'type' => 'sales_action',
                    'label' => 'Mark as Junk/Paused',
                    'properties' => [
                        'action_type' => 'update_status',
                        'status' => 'paused'
                    ]
                ]
            ],
            'edges' => [
                ['from' => '1', 'to' => '2'],
                ['from' => '2', 'to' => '3'],
                ['from' => '3', 'to' => '4', 'condition' => 'book_call'],
                ['from' => '3', 'to' => '5', 'condition' => 'not_now'],
                ['from' => '3', 'to' => '6', 'condition' => 'unsubscribed']
            ]
        ];

        Workflow::create([
            'tenant_id' => $tenantId,
            'name' => 'AI Smart Inbox Assistant (Deployed)',
            'description' => 'Standardized pre-packaged campaign tracking intent replies and taking automated sales actions.',
            'trigger_type' => 'email_event',
            'graph' => $graph,
            'is_active' => true,
        ]);

        return redirect()->route('workflows.index')->with('success', 'Automation Template successfully deployed and enabled!');
    }
}
