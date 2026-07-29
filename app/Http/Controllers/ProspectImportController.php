<?php

namespace App\Http\Controllers;

use App\Models\Prospect;
use Illuminate\Http\Request;

class ProspectImportController extends Controller
{
    /**
     * Import multiple prospects via CSV.
     */
    public function import(Request $request)
    {
        $tenantId = auth()->user()->organization_id ?? auth()->id();

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'blueprint_id' => [
                'nullable',
                \Illuminate\Validation\Rule::exists('blueprints', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
        ]);

        $file = $request->file('file');
        $blueprintId = $request->input('blueprint_id');

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
                    'contact_role' => $contactRole,
                    'status' => 'new',
                    'blueprint_id' => $blueprintId ?: null,
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
