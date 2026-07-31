<?php

namespace App\Workflows;

interface WorkflowNode
{
    /**
     * Execute the node action.
     *
     * @param array $input
     * @return array The output of the node
     */
    public function execute($input);
}
