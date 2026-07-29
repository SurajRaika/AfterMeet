<?php

namespace App\Http\Controllers;

use App\Models\Blueprint;
use App\Models\BlueprintStep;
use App\Models\Template;
use Illuminate\Http\Request;

class BlueprintController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $blueprints = Blueprint::where('tenant_id', $tenantId)->withCount('steps')->latest()->get();

        return view('theme::dashboard.blueprints.index', compact('blueprints'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $templates = Template::where('tenant_id', $tenantId)->latest()->get();

        return view('theme::dashboard.blueprints.create', compact('templates'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_attempts' => 'required|integer|min:1',
            'steps' => 'nullable|array',
            'steps.*.template_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('templates', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'steps.*.wait_days' => 'required|integer|min:0',
        ]);

        $blueprint = Blueprint::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'description' => $request->description,
            'max_attempts' => $request->max_attempts,
        ]);

        if ($request->has('steps')) {
            foreach ($request->steps as $index => $stepData) {
                BlueprintStep::create([
                    'blueprint_id' => $blueprint->id,
                    'step_order' => $index,
                    'template_id' => $stepData['template_id'],
                    'wait_days' => $stepData['wait_days'],
                ]);
            }
        }

        return redirect()->route('blueprints.index')->with('success', 'Blueprint created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $blueprint = Blueprint::where('tenant_id', $tenantId)->with('steps.template')->findOrFail($id);
        $templates = Template::where('tenant_id', $tenantId)->latest()->get();

        return view('theme::dashboard.blueprints.edit', compact('blueprint', 'templates'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $blueprint = Blueprint::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_attempts' => 'required|integer|min:1',
            'steps' => 'nullable|array',
            'steps.*.template_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('templates', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'steps.*.wait_days' => 'required|integer|min:0',
        ]);

        $blueprint->update([
            'name' => $request->name,
            'description' => $request->description,
            'max_attempts' => $request->max_attempts,
        ]);

        // Recreate steps
        $blueprint->steps()->delete();

        if ($request->has('steps')) {
            foreach ($request->steps as $index => $stepData) {
                BlueprintStep::create([
                    'blueprint_id' => $blueprint->id,
                    'step_order' => $index,
                    'template_id' => $stepData['template_id'],
                    'wait_days' => $stepData['wait_days'],
                ]);
            }
        }

        return redirect()->route('blueprints.index')->with('success', 'Blueprint updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $blueprint = Blueprint::where('tenant_id', $tenantId)->findOrFail($id);

        $blueprint->delete();

        return redirect()->route('blueprints.index')->with('success', 'Blueprint deleted successfully.');
    }
}
