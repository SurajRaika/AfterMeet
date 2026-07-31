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
                ['id' => '1', 'type' => 'enrichment'],
                ['id' => '2', 'type' => 'condition'],
                ['id' => '3', 'type' => 'send_email'],
                ['id' => '4', 'type' => 'sales_action'],
            ],
            'edges' => [
                ['from' => '1', 'to' => '2'],
                ['from' => '2', 'to' => '3', 'condition' => 'true'],
                ['from' => '2', 'to' => '4', 'condition' => 'false'],
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
}
