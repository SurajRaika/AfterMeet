<?php

namespace App\Http\Controllers;

use App\Models\Blueprint;
use App\Models\Prospect;
use App\Models\ProspectStepLog;
use App\Models\ProspectView;
use App\Models\Template;
use App\Services\NylasService;
use Illuminate\Http\Request;

class ProspectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        // 1. Fetch or auto-create default views for this tenant
        $views = ProspectView::where('tenant_id', $tenantId)->get();
        if ($views->isEmpty()) {
            ProspectView::create([
                'tenant_id' => $tenantId,
                'name' => 'High Value Leads',
                'filters' => [
                    ['column' => 'stage', 'operator' => '=', 'value' => 'Engaged'],
                    ['column' => 'country', 'operator' => '=', 'value' => 'USA'],
                    ['column' => 'company_size', 'operator' => '>', 'value' => '100'],
                ],
                'sort_by' => 'company_size',
                'sort_direction' => 'desc',
                'visibility' => 'shared',
            ]);

            ProspectView::create([
                'tenant_id' => $tenantId,
                'name' => 'Trade Show Contacts',
                'filters' => [
                    ['column' => 'source', 'operator' => '=', 'value' => 'Event'],
                    ['column' => 'event', 'operator' => '=', 'value' => 'Canton Fair'],
                ],
                'sort_by' => 'created_at',
                'sort_direction' => 'desc',
                'visibility' => 'shared',
            ]);

            // Re-fetch
            $views = ProspectView::where('tenant_id', $tenantId)->get();
        }

        // If tenant has no prospects, seed some mock ones to showcase the views
        if (Prospect::where('tenant_id', $tenantId)->count() === 0) {
            Prospect::create([
                'tenant_id' => $tenantId,
                'company_name' => 'Acme Inc',
                'contact_name' => 'John Doe',
                'contact_email' => 'johndoe@acme.com',
                'contact_role' => 'VP of Growth',
                'status' => 'active',
                'stage' => 'Engaged',
                'country' => 'USA',
                'company_size' => 150,
                'source' => 'Outbound',
            ]);

            Prospect::create([
                'tenant_id' => $tenantId,
                'company_name' => 'TradeCo',
                'contact_name' => 'Sven Gustafsson',
                'contact_email' => 'sven@tradeco.com',
                'contact_role' => 'Logistics Mgr',
                'status' => 'new',
                'stage' => 'New',
                'country' => 'Sweden',
                'company_size' => 45,
                'source' => 'Event',
                'event' => 'Canton Fair',
            ]);

            Prospect::create([
                'tenant_id' => $tenantId,
                'company_name' => 'Global Sales Corp',
                'contact_name' => 'Sarah Connor',
                'contact_email' => 'sarah@globalsales.com',
                'contact_role' => 'CEO',
                'status' => 'paused',
                'stage' => 'Researching',
                'country' => 'USA',
                'company_size' => 80,
                'source' => 'Inbound',
            ]);
        }

        $query = Prospect::where('tenant_id', $tenantId)->with('blueprint');

        // 2. Filter by View if set
        $selectedViewId = $request->get('view');
        $selectedView = null;
        if ($selectedViewId && $selectedViewId !== 'all') {
            $selectedView = ProspectView::where('tenant_id', $tenantId)->find($selectedViewId);
            if ($selectedView) {
                $whitelist = ['stage', 'status', 'country', 'company_size', 'source', 'event', 'company_name', 'contact_name', 'contact_email', 'contact_role'];
                $operators = ['=', '>', '<', '!=', 'like'];
                if (is_array($selectedView->filters)) {
                    foreach ($selectedView->filters as $filter) {
                        $col = $filter['column'] ?? null;
                        $op = $filter['operator'] ?? '=';
                        $val = $filter['value'] ?? '';

                        if ($col && in_array($col, $whitelist) && in_array($op, $operators)) {
                            if ($op === 'like') {
                                $query->where($col, 'like', '%' . $val . '%');
                            } else {
                                $query->where($col, $op, $val);
                            }
                        }
                    }
                }

                if ($selectedView->sort_by && in_array($selectedView->sort_by, $whitelist)) {
                    $dir = in_array(strtolower($selectedView->sort_direction ?? 'desc'), ['asc', 'desc']) ? $selectedView->sort_direction : 'desc';
                    $query->orderBy($selectedView->sort_by, $dir);
                } else {
                    $query->latest();
                }
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        // Keep standard status filtering too if set in GET
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $prospects = $query->get();
        $blueprints = Blueprint::where('tenant_id', $tenantId)->get();

        return view('theme::dashboard.prospects.index', compact('prospects', 'blueprints', 'views', 'selectedViewId', 'selectedView'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $blueprints = Blueprint::where('tenant_id', $tenantId)->get();

        return view('theme::dashboard.prospects.create', compact('blueprints'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_role' => 'nullable|string|max:255',
            'status' => 'required|in:new,active,qualified,junk,paused',
            'blueprint_id' => [
                'nullable',
                \Illuminate\Validation\Rule::exists('blueprints', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'notes' => 'nullable|string',
            'stage' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'company_size' => 'nullable|integer|min:0',
            'source' => 'nullable|string|max:255',
            'event' => 'nullable|string|max:255',
        ]);

        Prospect::create([
            'tenant_id' => $tenantId,
            'company_name' => $request->company_name,
            'contact_name' => $request->contact_name,
            'contact_email' => $request->contact_email,
            'contact_role' => $request->contact_role,
            'status' => $request->status,
            'blueprint_id' => $request->blueprint_id,
            'current_step_order' => 0,
            'notes' => $request->notes,
            'stage' => $request->stage ?? 'New',
            'country' => $request->country,
            'company_size' => $request->company_size,
            'source' => $request->source,
            'event' => $request->event,
        ]);

        return redirect()->route('prospects.index')->with('success', 'Prospect created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);
        $blueprints = Blueprint::where('tenant_id', $tenantId)->get();

        return view('theme::dashboard.prospects.edit', compact('prospect', 'blueprints'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_role' => 'nullable|string|max:255',
            'status' => 'required|in:new,active,qualified,junk,paused',
            'blueprint_id' => [
                'nullable',
                \Illuminate\Validation\Rule::exists('blueprints', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'current_step_order' => 'required|integer|min:0',
            'notes' => 'nullable|string',
            'stage' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'company_size' => 'nullable|integer|min:0',
            'source' => 'nullable|string|max:255',
            'event' => 'nullable|string|max:255',
        ]);

        $prospect->update([
            'company_name' => $request->company_name,
            'contact_name' => $request->contact_name,
            'contact_email' => $request->contact_email,
            'contact_role' => $request->contact_role,
            'status' => $request->status,
            'blueprint_id' => $request->blueprint_id,
            'current_step_order' => $request->current_step_order,
            'notes' => $request->notes,
            'stage' => $request->stage ?? 'New',
            'country' => $request->country,
            'company_size' => $request->company_size,
            'source' => $request->source,
            'event' => $request->event,
        ]);

        return redirect()->route('prospects.index')->with('success', 'Prospect updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);

        $prospect->delete();

        return redirect()->route('prospects.index')->with('success', 'Prospect deleted successfully.');
    }

    /**
     * Manually trigger the next step for this prospect.
     */
    public function sendNextStep($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);

        // 1. Get current step
        $step = $prospect->currentStep();
        if (!$step) {
            return redirect()->back()->with('error', 'No pending step found for this prospect.');
        }

        // 2. Ensure Nylas account is connected
        $nylasAccount = auth()->user()->nylasAccounts()->first();
        if (!$nylasAccount) {
            return redirect()->back()->with('error', 'Please connect a Nylas account first.');
        }

        // 3. Ensure template is present
        $template = $step->template;
        if (!$template) {
            return redirect()->back()->with('error', 'The template for this step is missing.');
        }

        // 4. Render template string
        $subject = Template::renderString($template->subject, $prospect);
        $body = Template::renderString($template->body, $prospect);

        // 5. Send via NylasService
        $nylasService = new NylasService();
        $payload = [
            'to' => [
                ['email' => $prospect->contact_email, 'name' => $prospect->contact_name]
            ],
            'subject' => $subject,
            'body' => $body,
        ];

        try {
            $response = $nylasService->sendMessage($nylasAccount->grant_id, $payload);

            if ($response && isset($response['data']['id'])) {
                $messageId = $response['data']['id'];

                // Log the step send
                ProspectStepLog::create([
                    'prospect_id' => $prospect->id,
                    'blueprint_step_id' => $step->id,
                    'sent_at' => now(),
                    'message_id' => $messageId,
                ]);

                // Increment step order and set timestamps
                $prospect->current_step_order += 1;
                $prospect->last_sent_at = now();
                if ($prospect->status === 'new') {
                    $prospect->status = 'active';
                }
                $prospect->save();

                return redirect()->back()->with('success', 'Email dispatched successfully via Nylas, logged, and step advanced.');
            } else {
                return redirect()->back()->with('error', 'Failed to send email. Nylas API rejected the payload.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Exception occurred: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created custom Prospect View.
     */
    public function storeView(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'required|array',
            'sort_by' => 'nullable|string|max:255',
            'sort_direction' => 'nullable|string|in:asc,desc',
            'visibility' => 'nullable|string|in:private,shared',
        ]);

        $rawFilters = $request->input('filters', []);
        $cleanFilters = [];
        foreach ($rawFilters as $filter) {
            if (!empty($filter['column'])) {
                $cleanFilters[] = [
                    'column' => $filter['column'],
                    'operator' => $filter['operator'] ?? '=',
                    'value' => $filter['value'] ?? '',
                ];
            }
        }

        ProspectView::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'filters' => $cleanFilters,
            'sort_by' => $request->sort_by,
            'sort_direction' => $request->sort_direction ?? 'asc',
            'visibility' => $request->visibility ?? 'private',
        ]);

        return redirect()->back()->with('success', 'Custom view created successfully.');
    }

    /**
     * Delete a custom Prospect View.
     */
    public function destroyView($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $view = ProspectView::where('tenant_id', $tenantId)->findOrFail($id);
        $view->delete();

        return redirect()->route('prospects.index')->with('success', 'Custom view deleted successfully.');
    }

    /**
     * Update a prospect's stage dynamically (e.g. from Kanban drag & drop).
     */
    public function updateStage(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'stage' => 'required|string|in:New,Researching,Ready to Contact,Contacted,Engaged,Connected,Converted,Archived',
        ]);

        $prospect->update([
            'stage' => $request->stage,
        ]);

        return response()->json(['success' => true]);
    }
}
