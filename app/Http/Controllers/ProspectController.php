<?php

namespace App\Http\Controllers;

use App\Models\Blueprint;
use App\Models\Prospect;
use App\Models\ProspectStepLog;
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
        $query = Prospect::where('tenant_id', $tenantId)->with('blueprint');

        $views = \App\Models\ProspectView::where('tenant_id', $tenantId)->get();
        $activeView = null;

        if ($request->has('view_id') && $request->view_id !== '') {
            $activeView = \App\Models\ProspectView::where('tenant_id', $tenantId)->find($request->view_id);
            if ($activeView) {
                $filters = $activeView->filters ?? [];
                foreach ($filters as $filter) {
                    $field = $filter['field'] ?? null;
                    $operator = $filter['operator'] ?? '=';
                    $value = $filter['value'] ?? '';

                    if ($field && in_array($field, ['company_name', 'contact_name', 'contact_email', 'contact_role', 'status', 'notes'])) {
                        if ($operator === 'like') {
                            $query->where($field, 'like', '%' . $value . '%');
                        } elseif ($operator === 'not_like') {
                            $query->where($field, 'not like', '%' . $value . '%');
                        } else {
                            $query->where($field, $operator, $value);
                        }
                    }
                }

                if ($activeView->sort_field) {
                    $sortOrder = $activeView->sort_order ?? 'asc';
                    $query->orderBy($activeView->sort_field, $sortOrder);
                } else {
                    $query->latest();
                }
            }
        }

        if (!$activeView) {
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }
            $query->latest();
        }

        $prospects = $query->get();
        $blueprints = Blueprint::where('tenant_id', $tenantId)->get();

        return view('theme::dashboard.prospects.index', compact('prospects', 'blueprints', 'views', 'activeView'));
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
        ]);

        return redirect()->route('prospects.index')->with('success', 'Prospect updated successfully.');
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospect = Prospect::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'status' => 'required|in:new,active,qualified,junk,paused',
        ]);

        $prospect->update([
            'status' => $request->status,
        ]);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Prospect status updated successfully.');
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
}
