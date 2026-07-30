<?php

namespace App\Http\Controllers;

use App\Models\ProspectView;
use Illuminate\Http\Request;

class ProspectViewController extends Controller
{
    /**
     * Show the form for creating a new view.
     */
    public function create()
    {
        $fields = $this->getFilterableFields();
        $operators = $this->getOperators();

        return view('theme::dashboard.prospects.views.create', compact('fields', 'operators'));
    }

    /**
     * Store a newly created view in storage.
     */
    public function store(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'required|array|min:1',
            'filters.*.field' => 'required|string|in:company_name,contact_name,contact_email,contact_role,status,notes',
            'filters.*.operator' => 'required|string|in:=,!=,like,not_like',
            'filters.*.value' => 'nullable|string|max:255',
            'sort_field' => 'nullable|string|in:company_name,contact_name,contact_email,contact_role,status,created_at',
            'sort_order' => 'required|in:asc,desc',
        ]);

        // Clean up empty filters
        $filters = array_values(array_filter($request->filters, function ($f) {
            return !empty($f['field']);
        }));

        ProspectView::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'filters' => $filters,
            'sort_field' => $request->sort_field,
            'sort_order' => $request->sort_order,
        ]);

        return redirect()->route('prospects.index')->with('success', 'Saved View created successfully.');
    }

    /**
     * Show the form for editing the specified view.
     */
    public function edit($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $view = ProspectView::where('tenant_id', $tenantId)->findOrFail($id);

        $fields = $this->getFilterableFields();
        $operators = $this->getOperators();

        return view('theme::dashboard.prospects.views.edit', compact('view', 'fields', 'operators'));
    }

    /**
     * Update the specified view in storage.
     */
    public function update(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $view = ProspectView::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'required|array|min:1',
            'filters.*.field' => 'required|string|in:company_name,contact_name,contact_email,contact_role,status,notes',
            'filters.*.operator' => 'required|string|in:=,!=,like,not_like',
            'filters.*.value' => 'nullable|string|max:255',
            'sort_field' => 'nullable|string|in:company_name,contact_name,contact_email,contact_role,status,created_at',
            'sort_order' => 'required|in:asc,desc',
        ]);

        // Clean up empty filters
        $filters = array_values(array_filter($request->filters, function ($f) {
            return !empty($f['field']);
        }));

        $view->update([
            'name' => $request->name,
            'filters' => $filters,
            'sort_field' => $request->sort_field,
            'sort_order' => $request->sort_order,
        ]);

        return redirect()->route('prospects.index', ['view_id' => $view->id])->with('success', 'Saved View updated successfully.');
    }

    /**
     * Remove the specified view from storage.
     */
    public function destroy($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $view = ProspectView::where('tenant_id', $tenantId)->findOrFail($id);

        $view->delete();

        return redirect()->route('prospects.index')->with('success', 'Saved View deleted successfully.');
    }

    /**
     * Helper list of filterable fields.
     */
    private function getFilterableFields(): array
    {
        return [
            'contact_name' => 'Contact Name',
            'contact_email' => 'Contact Email',
            'company_name' => 'Company Name',
            'contact_role' => 'Contact Role',
            'status' => 'Status',
            'notes' => 'Notes',
        ];
    }

    /**
     * Helper list of operators.
     */
    private function getOperators(): array
    {
        return [
            '=' => 'Equals',
            '!=' => 'Not Equals',
            'like' => 'Contains',
            'not_like' => 'Does Not Contain',
        ];
    }
}
