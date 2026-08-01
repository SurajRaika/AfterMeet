<?php

namespace App\Workflows;

use App\Models\AutomationInstance;

interface WorkflowNode
{
    /**
     * Execute the node's business logic.
     *
     * @param AutomationInstance $instance
     * @param array $nodeConfig
     * @param array $inputData
     * @return array The structured output payload from this node.
     */
    public function execute(AutomationInstance $instance, array $nodeConfig, array $inputData): array;
}
