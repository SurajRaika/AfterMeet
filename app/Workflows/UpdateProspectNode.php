<?php

namespace App\Workflows;

use App\Models\AutomationInstance;
use Illuminate\Support\Facades\Log;

class UpdateProspectNode implements WorkflowNode
{
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array
    {
        $prospect = $instance->prospect;
        $fields = $nodeConfig['fields'] ?? [];

        Log::info("[UpdateProspectNode] Updating prospect {$prospect->id} fields:", $fields);

        if (!empty($fields)) {
            foreach ($fields as $key => $val) {
                // Cast boolean values explicitly to 1 or 0 for SQLite/DB safety if needed
                if (is_bool($val)) {
                    $prospect->{$key} = $val ? 1 : 0;
                } else {
                    $prospect->{$key} = $val;
                }
            }
            $prospect->save();
        }

        return [
            'status' => 'updated',
            'updated_fields' => array_keys($fields),
        ];
    }
}
