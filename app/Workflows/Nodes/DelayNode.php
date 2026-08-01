<?php

namespace App\Workflows\Nodes;

use App\Workflows\WorkflowNode;
use App\Models\Prospect;

class DelayNode implements WorkflowNode
{
    public function execute($input)
    {
        $waitDays = (int)($input['wait_days'] ?? 2);
        $prospectId = $input['prospect_id'] ?? null;

        $nextSendAt = now()->addDays($waitDays);

        if ($prospectId) {
            $prospect = Prospect::find($prospectId);
            if ($prospect) {
                $prospect->update([
                    'next_send_at' => $nextSendAt,
                ]);
            }
        }

        return [
            'delayed' => true,
            'wait_days' => $waitDays,
            'next_send_at' => $nextSendAt->toDateTimeString(),
        ];
    }
}
