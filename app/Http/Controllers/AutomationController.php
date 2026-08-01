<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use App\Models\AutomationInstance;
use App\Models\Prospect;
use App\Services\AutomationEngine;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $templates = Automation::where('is_template', true)->get();

        $customAutomations = Automation::where('tenant_id', $tenantId)
            ->where('is_template', false)
            ->latest()
            ->get();

        $instances = AutomationInstance::with(['automation', 'prospect'])
            ->whereHas('automation', function ($query) use ($tenantId) {
                $query->where('tenant_id', $tenantId)->orWhereNull('tenant_id');
            })
            ->latest()
            ->get();

        $prospects = Prospect::where('tenant_id', $tenantId)->get();

        return view('theme::dashboard.automations.index', compact('templates', 'customAutomations', 'instances', 'prospects'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $templateId = $request->get('template_id');
        $template = null;
        if ($templateId) {
            $template = Automation::findOrFail($templateId);
        }

        return view('theme::dashboard.automations.create', compact('template'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:trigger,action',
            'workflow_definition' => 'required|string', // JSON string
        ]);

        $definition = json_decode($request->workflow_definition, true);
        if (!$definition) {
            return redirect()->back()->withInput()->with('error', 'Invalid workflow JSON structure.');
        }

        Automation::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'type' => $request->type,
            'workflow_definition' => $definition,
            'is_active' => false,
            'is_template' => false,
        ]);

        return redirect()->route('automations.index')->with('success', 'Automation workflow created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $automation = Automation::where(function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId)->orWhereNull('tenant_id');
        })->findOrFail($id);

        return view('theme::dashboard.automations.edit', compact('automation'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $automation = Automation::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:trigger,action',
            'workflow_definition' => 'required|string', // JSON string
        ]);

        $definition = json_decode($request->workflow_definition, true);
        if (!$definition) {
            return redirect()->back()->withInput()->with('error', 'Invalid workflow JSON structure.');
        }

        $automation->update([
            'name' => $request->name,
            'type' => $request->type,
            'workflow_definition' => $definition,
        ]);

        return redirect()->route('automations.index')->with('success', 'Automation workflow updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $automation = Automation::where('tenant_id', $tenantId)->findOrFail($id);
        $automation->delete();

        return redirect()->route('automations.index')->with('success', 'Automation deleted successfully.');
    }

    /**
     * Toggle the active state of an automation.
     */
    public function toggleActive($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $automation = Automation::where('tenant_id', $tenantId)->findOrFail($id);

        $automation->update([
            'is_active' => !$automation->is_active,
        ]);

        $statusStr = $automation->is_active ? 'activated' : 'deactivated';
        return redirect()->route('automations.index')->with('success', "Automation has been successfully {$statusStr}.");
    }

    /**
     * Duplicate a template or custom automation.
     */
    public function duplicate($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $automation = Automation::where(function ($query) use ($tenantId) {
            $query->whereNull('tenant_id')->orWhere('tenant_id', $tenantId);
        })->findOrFail($id);

        $copy = $automation->replicate();
        $copy->tenant_id = $tenantId;
        $copy->name = $automation->name . ' (Custom Copy)';
        $copy->is_active = false;
        $copy->is_template = false;
        $copy->save();

        return redirect()->route('automations.index')->with('success', "Copied '{$automation->name}' successfully to your customizable workflows.");
    }

    /**
     * Manually assign and trigger an automation for a prospect.
     */
    public function assignToProspect(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $automation = Automation::where(function ($query) use ($tenantId) {
            $query->whereNull('tenant_id')->orWhere('tenant_id', $tenantId);
        })->findOrFail($id);

        $request->validate([
            'prospect_id' => 'required|exists:prospects,id',
        ]);

        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($request->prospect_id);

        $exists = AutomationInstance::where('automation_id', $automation->id)
            ->where('prospect_id', $prospect->id)
            ->whereIn('status', ['active', 'paused'])
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'This prospect is already running an instance of this automation.');
        }

        $engine = new AutomationEngine();
        $engine->start($automation, $prospect);

        return redirect()->route('automations.index')->with('success', "Automation '{$automation->name}' successfully assigned to {$prospect->contact_name} and queued.");
    }
}
