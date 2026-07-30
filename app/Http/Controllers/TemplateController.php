<?php

namespace App\Http\Controllers;

use App\Models\Prospect;
use App\Models\Template;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $templates = Template::where('tenant_id', $tenantId)->latest()->get();

        return view('theme::dashboard.templates.index', compact('templates'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('theme::dashboard.templates.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        Template::create([
            'tenant_id' => auth()->user()->organization_id ?? auth()->id(),
            'name' => $request->name,
            'subject' => $request->subject,
            'body' => $request->body,
        ]);

        return redirect()->route('templates.index')->with('success', 'Template created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $template = Template::where('tenant_id', $tenantId)->findOrFail($id);

        return view('theme::dashboard.templates.edit', compact('template'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $template = Template::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $template->update([
            'name' => $request->name,
            'subject' => $request->subject,
            'body' => $request->body,
        ]);

        return redirect()->route('templates.index')->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $template = Template::where('tenant_id', $tenantId)->findOrFail($id);

        $template->delete();

        return redirect()->route('templates.index')->with('success', 'Template deleted successfully.');
    }

    /**
     * Preview the template with a dummy prospect.
     */
    public function preview($id)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $template = Template::where('tenant_id', $tenantId)->findOrFail($id);

        $dummy = new Prospect([
            'company_name' => 'Acme Corp',
            'contact_name' => 'John Doe',
            'contact_email' => 'john@acme.com',
            'contact_role' => 'VP of Engineering',
        ]);

        $previewSubject = Template::renderString($template->subject, $dummy);
        $previewBody = Template::renderString($template->body, $dummy);

        return view('theme::dashboard.templates.preview', compact('template', 'previewSubject', 'previewBody'));
    }
}
