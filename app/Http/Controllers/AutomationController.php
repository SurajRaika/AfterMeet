<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use App\Models\AutomationInstance;
use App\Models\AutomationRun;
use App\Models\Prospect;
use App\Workflows\WorkflowEngine;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    /**
     * Display a listing of automations.
     */
    public function index()
    {
        $automations = Automation::latest()->get();
        $prospects = Prospect::where('tenant_id', auth()->user()->organization_id ?? auth()->id())->get();

        return view('theme::dashboard.automations.index', compact('automations', 'prospects'));
    }

    /**
     * Toggle the active state of an automation.
     */
    public function toggle($id)
    {
        $automation = Automation::findOrFail($id);
        $automation->is_active = !$automation->is_active;
        $automation->save();

        return redirect()->route('automations.index')->with('success', "Automation '{$automation->name}' status updated.");
    }

    /**
     * Manually trigger/start an automation for a prospect.
     */
    public function trigger(Request $request, $id)
    {
        $request->validate([
            'prospect_id' => 'required|exists:prospects,id',
        ]);

        $automation = Automation::findOrFail($id);
        $prospect = Prospect::findOrFail($request->prospect_id);

        $engine = new WorkflowEngine();
        $instance = $engine->start($automation, $prospect, [
            'trigger' => 'manual_ui',
            'triggered_at' => now()->toDateTimeString(),
        ]);

        return redirect()->route('automations.runs', $automation->id)
            ->with('success', "Workflow instance successfully started for {$prospect->contact_name} at {$prospect->company_name}.");
    }

    /**
     * View run logs for an automation.
     */
    public function runs($id)
    {
        $automation = Automation::findOrFail($id);
        $instances = AutomationInstance::where('automation_id', $id)
            ->with(['prospect', 'runs'])
            ->latest()
            ->get();

        return view('theme::dashboard.automations.runs', compact('automation', 'instances'));
    }

    /**
     * Re-seed/enable default templates if they were deleted.
     */
    public function seedDefaults()
    {
        $seeder = new \Database\Seeders\AutomationsTableSeeder();
        $seeder->run();

        return redirect()->route('automations.index')->with('success', 'Default automation templates have been restored.');
    }

    /**
     * Delete an automation.
     */
    public function destroy($id)
    {
        $automation = Automation::findOrFail($id);
        $automation->delete();

        return redirect()->route('automations.index')->with('success', 'Automation deleted successfully.');
    }
}
