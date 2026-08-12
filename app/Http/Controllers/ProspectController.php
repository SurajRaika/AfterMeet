<?php

namespace App\Http\Controllers;

use App\Models\Prospect;
use App\Models\ProspectView;
use Illuminate\Http\Request;

class ProspectController extends Controller
{
    /**
     * Show the timeline of outreach for a prospect.
     */
    public function timeline($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);

        // Get user IDs belonging to this tenant/organization to restrict email access
        if (auth()->user()->organization_id) {
            $userIds = \App\Models\User::where('organization_id', auth()->user()->organization_id)
                ->pluck('id')
                ->toArray();
        } else {
            $userIds = [auth()->id()];
        }

        // Get Nylas account IDs for these users
        $nylasAccountIds = \App\Models\NylasAccount::whereIn('user_id', $userIds)
            ->pluck('id')
            ->toArray();

        // Get local email messages synced from Nylas matching prospect's contact email and owned by this tenant's users
        $events = \App\Models\EmailMessage::whereIn('nylas_account_id', $nylasAccountIds)
            ->where(function ($query) use ($prospect) {
                $query->where('from_email', $prospect->contact_email)
                      ->orWhere('to', 'like', '%' . $prospect->contact_email . '%');
            })
            ->get()
            ->map(function ($email) use ($prospect) {
                $isIncoming = strtolower($email->from_email) === strtolower($prospect->contact_email);

                return [
                    'type' => $isIncoming ? 'prospect_reply' : 'user_manual',
                    'timestamp' => $email->received_at ?? $email->created_at,
                    'subject' => $email->subject ?? 'No Subject',
                    'body' => $email->body_html ?? $email->body_snippet ?? '',
                    'message_id' => $email->nylas_message_id,
                    'from_email' => $email->from_email,
                    'from_name' => $email->from_name,
                ];
            })
            ->sortBy('timestamp')
            ->values();

        return view('theme::dashboard.prospects.timeline', compact('prospect', 'events'));
    }

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

        $query = Prospect::where('tenant_id', $tenantId);

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

        return view('theme::dashboard.prospects.index', compact('prospects', 'views', 'selectedViewId', 'selectedView'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('theme::dashboard.prospects.create');
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

        return view('theme::dashboard.prospects.edit', compact('prospect'));
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
