<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;
use App\Models\Prospect;

class SalesActionNode implements WorkflowNode
{
    public function execute($input)
    {
        $prospectId = $input['prospect_id'] ?? null;
        $action = $input['action_type'] ?? 'update_stage';
        $stage = $input['stage'] ?? 'Engaged';
        $status = $input['status'] ?? 'active';

        $applied = false;

        $tenantId = $input['tenant_id'] ?? null;

        if ($prospectId) {
            $prospect = $tenantId
                ? Prospect::where('tenant_id', $tenantId)->find($prospectId)
                : Prospect::find($prospectId);

            if ($prospect) {
                if ($action === 'update_stage') {
                    $prospect->update(['stage' => $stage]);
                    $applied = true;
                } elseif ($action === 'update_status') {
                    $prospect->update(['status' => $status]);
                    $applied = true;
                }
            }
        }

        return [
            'action_taken' => $action,
            'applied' => $applied,
            'stage_applied' => $stage,
            'status_applied' => $status,
        ];
    }
}
