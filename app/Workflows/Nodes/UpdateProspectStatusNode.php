<?php

namespace App\Workflows\Nodes;

use App\Models\AutomationInstance;
use App\Workflows\WorkflowNode;

class UpdateProspectStatusNode implements WorkflowNode
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function execute(AutomationInstance $instance, array $input): array
    {
        $prospect = $instance->prospect;
        if (!$prospect) {
            return ['status' => 'failed', 'error' => 'No prospect associated with instance.'];
        }

        $newStatus = $this->config['status'] ?? 'junk';
        $newStage = $this->config['stage'] ?? null;

        $prospect->status = $newStatus;
        if ($newStage) {
            $prospect->stage = $newStage;
        }
        $prospect->save();

        return [
            'status' => 'success',
            'updated_status' => $newStatus,
            'updated_stage' => $newStage,
        ];
    }
}
