<?php

namespace App\Workflows;

use App\Models\AutomationInstance;

interface WorkflowNode
{
    /**
     * Execute the node logic.
     *
     * @param AutomationInstance $instance
     * @param array $input Data passed from previous execution or trigger
     * @return array Output payload to be saved and potentially passed to the next node
     */
    public function execute(AutomationInstance $instance, array $input): array;
}
