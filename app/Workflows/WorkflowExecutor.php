<?php

namespace App\Workflows;

use App\Models\Workflow;
use App\Models\WorkflowRun;
use App\Models\WorkflowStepRun;
use App\Models\Prospect;
use Exception;

class WorkflowExecutor
{
    /**
     * Map node types to their PHP implementation classes.
     */
    protected array $nodeMap = [
        'enrichment' => \App\Workflows\Nodes\EnrichmentNode::class,
        'send_email' => \App\Workflows\Nodes\SendEmailNode::class,
        'intent' => \App\Workflows\Nodes\IntentNode::class,
        'condition' => \App\Workflows\Nodes\ConditionNode::class,
        'sales_action' => \App\Workflows\Nodes\SalesActionNode::class,
    ];

    /**
     * Execute a workflow.
     *
     * @param Workflow $workflow
     * @param array $initialInput
     * @param Prospect|null $prospect
     * @return WorkflowRun
     */
    public function execute(Workflow $workflow, array $initialInput = [], ?Prospect $prospect = null): WorkflowRun
    {
        // Create the workflow run record
        $run = WorkflowRun::create([
            'tenant_id' => $workflow->tenant_id,
            'workflow_id' => $workflow->id,
            'prospect_id' => $prospect?->id,
            'status' => 'running',
            'input' => $initialInput,
        ]);

        try {
            $graph = $workflow->graph;
            $nodes = $graph['nodes'] ?? [];
            $edges = $graph['edges'] ?? [];

            if (empty($nodes)) {
                $run->update([
                    'status' => 'completed',
                    'output' => $initialInput,
                ]);
                return $run;
            }

            // Find the starting node
            $startingNode = $this->findStartingNode($nodes, $edges);
            if (!$startingNode) {
                // Fallback: use first node
                $startingNode = $nodes[0];
            }

            $context = array_merge($initialInput, [
                'prospect_id' => $prospect?->id,
                'tenant_id' => $workflow->tenant_id,
            ]);

            $currentNode = $startingNode;
            $executedNodeIds = [];

            while ($currentNode) {
                $nodeId = $currentNode['id'] ?? null;

                // Prevent infinite loops
                if ($nodeId && in_array($nodeId, $executedNodeIds)) {
                    break;
                }
                $executedNodeIds[] = $nodeId;

                $nodeType = $currentNode['type'] ?? '';

                // Create a step run
                $stepRun = WorkflowStepRun::create([
                    'workflow_run_id' => $run->id,
                    'node_id' => $nodeId,
                    'node_type' => $nodeType,
                    'status' => 'running',
                    'input' => $context,
                ]);

                try {
                    $nodeClass = $this->nodeMap[$nodeType] ?? null;
                    if (!$nodeClass) {
                        throw new Exception("Unknown node type: {$nodeType}");
                    }

                    /** @var WorkflowNode $nodeInstance */
                    $nodeInstance = new $nodeClass();
                    $output = $nodeInstance->execute($context);

                    // Update context with node output
                    $context = array_merge($context, $output);

                    $stepRun->update([
                        'status' => 'completed',
                        'output' => $output,
                        'completed_at' => now(),
                    ]);

                    // Find next node
                    $currentNode = $this->findNextNode($currentNode, $output, $nodes, $edges);

                } catch (Exception $e) {
                    $stepRun->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);
                    throw $e;
                }
            }

            // Update the final run status
            $run->update([
                'status' => 'completed',
                'output' => $context,
            ]);

        } catch (Exception $e) {
            $run->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return $run;
    }

    /**
     * Find the node with no incoming edges.
     */
    protected function findStartingNode(array $nodes, array $edges): ?array
    {
        $targetIds = [];
        foreach ($edges as $edge) {
            $to = $edge['to'] ?? $edge['target'] ?? null;
            if ($to !== null) {
                $targetIds[$to] = true;
            }
        }

        foreach ($nodes as $node) {
            $id = $node['id'] ?? null;
            if ($id !== null && !isset($targetIds[$id])) {
                return $node;
            }
        }

        return null;
    }

    /**
     * Find the next node in the graph.
     */
    protected function findNextNode(array $currentNode, array $nodeOutput, array $nodes, array $edges): ?array
    {
        $currentId = $currentNode['id'] ?? null;
        if ($currentId === null) {
            return null;
        }

        $outgoingEdges = [];
        foreach ($edges as $edge) {
            $from = $edge['from'] ?? $edge['source'] ?? null;
            if ($from == $currentId) {
                $outgoingEdges[] = $edge;
            }
        }

        if (empty($outgoingEdges)) {
            return null;
        }

        // If it is a condition node, branch based on result
        if (($currentNode['type'] ?? '') === 'condition' && isset($nodeOutput['result'])) {
            $conditionResult = (bool)$nodeOutput['result'];
            $resultStr = $conditionResult ? 'true' : 'false';

            foreach ($outgoingEdges as $edge) {
                $condVal = $edge['condition'] ?? $edge['condition_value'] ?? $edge['label'] ?? null;
                if ($condVal !== null) {
                    // Normalize condition value comparison
                    $condValStr = strtolower((string)$condVal);
                    if ($condValStr === $resultStr || ($conditionResult && $condValStr === '1') || (!$conditionResult && $condValStr === '0')) {
                        return $this->findNodeById($edge['to'] ?? $edge['target'] ?? null, $nodes);
                    }
                }
            }
        }

        // Default: return the first outgoing edge target
        $firstEdge = $outgoingEdges[0];
        return $this->findNodeById($firstEdge['to'] ?? $firstEdge['target'] ?? null, $nodes);
    }

    /**
     * Find a node in the list by its ID.
     */
    protected function findNodeById(?string $id, array $nodes): ?array
    {
        if ($id === null) {
            return null;
        }

        foreach ($nodes as $node) {
            if (($node['id'] ?? null) == $id) {
                return $node;
            }
        }

        return null;
    }
}
