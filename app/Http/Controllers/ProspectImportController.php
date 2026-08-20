<?php

namespace App\Http\Controllers;

use App\Models\Prospect;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProspectImportController extends Controller
{
    /**
     * Show the CSV import form.
     */
    public function show()
    {
        return view('theme::dashboard.prospects.import');
    }

    /**
     * Download a sample CSV file structure.
     */
    public function downloadSample()
    {
        $csvContent = "company_name,contact_name,contact_email,contact_role,notes,country,company_size,source,event\n" .
            "Acme Corp,John Smith,john@acme.com,Director of Marketing,Interested in the product,USA,150,Outbound,Canton Fair\n" .
            "Stark Industries,Tony Stark,tony@stark.com,CEO,High-value prospect,USA,500,LeadList,";

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="prospects_sample.csv"',
        ]);
    }

    /**
     * Handle the uploaded CSV file and direct to column mapping screen.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');

        // Store temporarily
        $tempPath = $file->store('temp_imports');

        // Read headers
        $headers = [];
        if (($handle = fopen(Storage::path($tempPath), 'r')) !== false) {
            $rawHeader = fgetcsv($handle, 1000, ',');
            if ($rawHeader) {
                // Clean and keep original for dropdown labels
                foreach ($rawHeader as $index => $h) {
                    $cleaned = preg_replace('/[\x00-\x1F\x7F-\x9F\xEF\xBB\xBF]/', '', $h);
                    $headers[$index] = trim($cleaned);
                }
            }
            fclose($handle);
        }

        if (empty($headers)) {
            return redirect()->back()->withErrors(['file' => 'The CSV file seems empty or has invalid format.']);
        }

        // Put temp info in session
        session([
            'import_temp_path' => $tempPath,
        ]);

        // List of prospect model fields to map
        $fields = [
            'contact_name' => ['label' => 'Contact Name', 'required' => true, 'matches' => ['contact_name', 'name', 'contact']],
            'contact_email' => ['label' => 'Contact Email', 'required' => true, 'matches' => ['contact_email', 'email', 'mail']],
            'company_name' => ['label' => 'Company Name', 'required' => false, 'matches' => ['company_name', 'company', 'organization']],
            'contact_role' => ['label' => 'Contact Role / Job Title', 'required' => false, 'matches' => ['contact_role', 'role', 'title', 'job_title']],
            'notes' => ['label' => 'Notes / Description', 'required' => false, 'matches' => ['notes', 'description', 'bio']],
            'country' => ['label' => 'Country', 'required' => false, 'matches' => ['country', 'nation']],
            'company_size' => ['label' => 'Company Size', 'required' => false, 'matches' => ['company_size', 'size', 'employees']],
            'source' => ['label' => 'Source', 'required' => false, 'matches' => ['source']],
            'event' => ['label' => 'Event', 'required' => false, 'matches' => ['event', 'conference']],
        ];

        // Suggest mapped dropdown defaults
        $suggestedMapping = [];
        foreach ($fields as $fieldKey => $fieldMeta) {
            $suggestedMapping[$fieldKey] = '';
            foreach ($headers as $index => $header) {
                $normalizedHeader = strtolower(trim($header));
                foreach ($fieldMeta['matches'] as $match) {
                    if (str_contains($normalizedHeader, $match) || $normalizedHeader === $match) {
                        $suggestedMapping[$fieldKey] = $index;
                        break 2;
                    }
                }
            }
        }

        return view('theme::dashboard.prospects.map', compact('headers', 'fields', 'suggestedMapping'));
    }

    /**
     * Process actual import with user mappings.
     */
    public function process(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();
        $tempPath = session('import_temp_path');

        if (!$tempPath || !Storage::exists($tempPath)) {
            return redirect()->route('prospects.import.show')->with('error', 'Temporary file not found or expired. Please upload again.');
        }

        $request->validate([
            'mappings' => 'required|array',
            'mappings.contact_name' => 'required',
            'mappings.contact_email' => 'required',
        ]);

        $mappings = $request->input('mappings');

        $imported = 0;
        $skipped = 0;

        if (($handle = fopen(Storage::path($tempPath), 'r')) !== false) {
            // Skip the header row
            fgetcsv($handle, 1000, ',');

            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                // Map the CSV values to our target fields
                $contactNameIndex = $mappings['contact_name'];
                $contactEmailIndex = $mappings['contact_email'];

                $contactName = isset($data[$contactNameIndex]) ? trim($data[$contactNameIndex]) : '';
                $contactEmail = isset($data[$contactEmailIndex]) ? trim($data[$contactEmailIndex]) : '';

                if (empty($contactEmail) || !filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
                    $skipped++;
                    continue;
                }

                $companyNameIndex = $mappings['company_name'] ?? '';
                $companyName = ($companyNameIndex !== '' && isset($data[$companyNameIndex])) ? trim($data[$companyNameIndex]) : '';

                $contactRoleIndex = $mappings['contact_role'] ?? '';
                $contactRole = ($contactRoleIndex !== '' && isset($data[$contactRoleIndex])) ? trim($data[$contactRoleIndex]) : null;

                $notesIndex = $mappings['notes'] ?? '';
                $notes = ($notesIndex !== '' && isset($data[$notesIndex])) ? trim($data[$notesIndex]) : null;

                $countryIndex = $mappings['country'] ?? '';
                $country = ($countryIndex !== '' && isset($data[$countryIndex])) ? trim($data[$countryIndex]) : null;

                $companySizeIndex = $mappings['company_size'] ?? '';
                $companySize = ($companySizeIndex !== '' && isset($data[$companySizeIndex]) && is_numeric($data[$companySizeIndex])) ? intval($data[$companySizeIndex]) : null;

                $sourceIndex = $mappings['source'] ?? '';
                $source = ($sourceIndex !== '' && isset($data[$sourceIndex])) ? trim($data[$sourceIndex]) : null;

                $eventIndex = $mappings['event'] ?? '';
                $event = ($eventIndex !== '' && isset($data[$eventIndex])) ? trim($data[$eventIndex]) : null;

                Prospect::create([
                    'tenant_id' => $tenantId,
                    'company_name' => $companyName ?: 'Unknown',
                    'contact_name' => $contactName ?: 'Unknown',
                    'contact_email' => $contactEmail,
                    'contact_role' => $contactRole,
                    'status' => 'new',
                    'current_step_order' => 0,
                    'notes' => $notes,
                    'stage' => 'New',
                    'country' => $country,
                    'company_size' => $companySize,
                    'source' => $source,
                    'event' => $event,
                ]);

                $imported++;
            }
            fclose($handle);
        }

        // Clean up temp file
        Storage::delete($tempPath);
        session()->forget(['import_temp_path']);

        $message = "Prospects import completed. Successfully imported: {$imported}";
        if ($skipped > 0) {
            $message .= ", skipped {$skipped} malformed/empty row(s)";
        }
        $message .= ".";

        return redirect()->route('prospects.index')->with('success', $message);
    }

    /**
     * Import multiple prospects via CSV directly (compatibility fallback for automated testing).
     */
    public function import(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');

        $imported = 0;
        $skipped = 0;

        if (($handle = fopen($file->getRealPath(), 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');

            if ($header) {
                // Normalize header to lowercase, strip out UTF-8 BOM, and replace spaces/hyphens with underscores
                $header = array_map(function($h) {
                    $cleaned = strtolower(trim(preg_replace('/[\x00-\x1F\x7F-\x9F\xEF\xBB\xBF]/', '', $h)));
                    return str_replace([' ', '-'], '_', $cleaned);
                }, $header);
            }

            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                if (count($data) > count($header)) {
                    $data = array_slice($data, 0, count($header));
                }
                $row = array_combine($header, array_pad($data, count($header), null));

                // Flexible field mapping
                $companyName = $row['company_name'] ?? $row['company'] ?? '';
                $contactName = $row['contact_name'] ?? $row['contact'] ?? $row['name'] ?? '';
                $contactEmail = trim($row['contact_email'] ?? $row['email'] ?? '');
                $contactRole = $row['contact_role'] ?? $row['role'] ?? null;
                $notes = $row['notes'] ?? $row['description'] ?? null;

                // Validate email format strictly
                if (empty($contactEmail) || !filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
                    $skipped++;
                    continue;
                }

                Prospect::create([
                    'tenant_id' => $tenantId,
                    'company_name' => $companyName ?: 'Unknown',
                    'contact_name' => $contactName ?: 'Unknown',
                    'contact_email' => $contactEmail,
                    'status' => 'new',
                    'current_step_order' => 0,
                    'notes' => $notes,
                ]);

                $imported++;
            }
            fclose($handle);
        }

        $message = "Prospects import completed. Successfully imported: {$imported}";
        if ($skipped > 0) {
            $message .= ", skipped {$skipped} malformed/empty row(s)";
        }
        $message .= ".";

        return redirect()->route('prospects.index')->with('success', $message);
    }
}
