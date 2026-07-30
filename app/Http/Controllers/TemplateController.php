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
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $prospects = Prospect::where('tenant_id', $tenantId)->get();
        $fields = \Illuminate\Support\Facades\Schema::getColumnListing('prospects');

        return view('theme::dashboard.templates.create', compact('prospects', 'fields'));
    }

    /**
     * Generate an AI personalized email variant using Laravel AI SDK.
     */
    public function generateAi(Request $request)
    {
        $request->validate([
            'subject' => 'required|string',
            'body' => 'required|string',
            'prospect_id' => 'required|string',
            'creativity' => 'required|string',
            'active_fields' => 'required|array',
        ]);

        $subject = $request->subject;
        $body = $request->body;
        $prospectId = $request->prospect_id;
        $creativity = $request->creativity;
        $activeFields = $request->active_fields;

        $prospect = null;
        if (str_starts_with($prospectId, 'real_')) {
            $dbId = substr($prospectId, 5);
            $prospect = Prospect::find($dbId);
        } else if (str_starts_with($prospectId, 'mock_')) {
            $dbId = substr($prospectId, 5);
            // Fallback mock details can be handled manually below
        } else {
            $prospect = Prospect::find($prospectId);
        }

        // Build context from active fields
        $contextLines = [];
        if ($prospect) {
            foreach ($activeFields as $fieldId) {
                $val = $prospect->$fieldId ?? null;
                if ($val) {
                    $contextLines[] = "{$fieldId}: {$val}";
                }
            }
        }

        $contextString = implode("\n", $contextLines);

        $systemPrompt = "You are a world-class B2B AI Agent Email Strategist.\n" .
                        "Your goal is to re-synthesize a reference email into a bespoke, high-converting personalized variation for a specific prospect.\n\n" .
                        "CRITICAL INSTRUCTIONS:\n" .
                        "1. Do NOT write boilerplate AI fluff or generic sales talk.\n" .
                        "2. Maintain the intent, CTA, and overall core message of the Reference Email, but write with natural human tone.\n" .
                        "3. Fluidly integrate relevant details from the CRM Prospect Context.\n" .
                        "4. Match creativity level:\n" .
                        "   - 'strict': Minimal modifications, exact intent, strictly natural phrasing adjustments.\n" .
                        "   - 'balanced': Smart rewrites, natural phrasing, subtle context inclusion.\n" .
                        "   - 'creative': Engaging hook adaptation, tailored executive angle, high personalization.\n" .
                        "5. Return ONLY a valid JSON object matching this exact structure:\n" .
                        "{\n" .
                        "  \"subject\": \"The personalized subject line\",\n" .
                        "  \"message\": \"The personalized body email body text\",\n" .
                        "  \"strategyInsight\": \"A 1-2 sentence breakdown explaining your copywriting strategy.\"\n" .
                        "}";

        $userPrompt = "CREATIVITY LEVEL: " . strtoupper($creativity) . "\n\n" .
                      "REFERENCE SUBJECT:\n{$subject}\n\n" .
                      "REFERENCE BODY:\n{$body}\n\n" .
                      "CRM PROSPECT CONTEXT DATA:\n{$contextString}";

        try {
            if (config('ai.providers.gemini.key') || config('ai.providers.openai.key')) {
                $aiResponse = \Laravel\Ai\Facades\Ai::text($userPrompt, [
                    'system' => $systemPrompt
                ]);

                $data = json_decode((string)$aiResponse, true);
                if ($data && isset($data['subject']) && isset($data['message'])) {
                    return response()->json($data);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Laravel AI SDK failed: " . $e->getMessage());
        }

        // Fallback generator if AI keys are not set up or call fails
        $company = $prospect->company_name ?? 'your company';
        $contact = $prospect->contact_name ?? 'there';
        $role = $prospect->contact_role ?? 'VP';
        $notes = $prospect->notes ?? '';

        $fallbackSubject = $subject;
        foreach (['company_name', 'contact_name', 'contact_role', 'notes'] as $key) {
            $val = $prospect->$key ?? '';
            $fallbackSubject = str_replace('{{' . $key . '}}', $val, $fallbackSubject);
        }
        $fallbackSubject .= " — Tailored for " . $company;

        $fallbackBody = "Hi " . $contact . ",\n\nIt was great connecting. Following up on your role as " . $role . " at " . $company . ", I wanted to reach out regarding our automation solutions.\n\n" . ($notes ? "I noted from our context: " . $notes . "\n\n" : "") . "Would you be open to a quick 10-minute call next week to discuss how we can help " . $company . "?\n\nBest regards,\nAlex Vance";
        $fallbackInsight = "Incorporated prospect profile as " . $role . " at " . $company . ". Generated personalized hook.";

        return response()->json([
            'subject' => $fallbackSubject,
            'message' => $fallbackBody,
            'strategyInsight' => $fallbackInsight
        ]);
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

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Template created successfully.',
            ]);
        }

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
