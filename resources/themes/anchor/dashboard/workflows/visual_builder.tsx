import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge as rfAddEdge,
  Connection,
  Edge as RfEdge,
  Node as RfNode,
} from 'reactflow';

import 'reactflow/dist/style.css';

interface NodeProperties {
  condition_field?: string;
  condition_operator?: string;
  condition_value?: string;
  subject?: string;
  body?: string;
  action_type?: string;
  stage?: string;
  status?: string;
  intent_expected?: string;
}

export default function VisualWorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Sync to backend's hidden textarea
  const syncToTextarea = (updatedNodes: RfNode[], updatedEdges: RfEdge[]) => {
    const textarea = document.getElementById('graph') as HTMLTextAreaElement;
    if (textarea) {
      const serializedNodes = updatedNodes.map(n => ({
        id: n.id,
        type: n.type || 'enrichment',
        label: n.data?.label || n.id,
        properties: n.data?.properties || {},
        position: n.position,
      }));

      const serializedEdges = updatedEdges.map(e => ({
        from: e.source,
        to: e.target,
        condition: e.label || undefined,
      }));

      textarea.value = JSON.stringify({ nodes: serializedNodes, edges: serializedEdges }, null, 2);
    }
  };

  // Load initial graph
  useEffect(() => {
    try {
      const textarea = document.getElementById('graph') as HTMLTextAreaElement;
      if (textarea && textarea.value) {
        const parsed = JSON.parse(textarea.value);
        if (parsed.nodes) {
          const rfNodes = parsed.nodes.map((n: any, idx: number) => ({
            id: String(n.id),
            type: n.type || 'enrichment',
            data: { label: n.label || n.type, properties: n.properties || {} },
            position: n.position || { x: 100 + (idx * 150), y: 150 + (idx * 50) },
          }));
          setNodes(rfNodes);
        }
        if (parsed.edges) {
          const rfEdges = parsed.edges.map((e: any, idx: number) => ({
            id: `e-${e.from}-${e.to}-${idx}`,
            source: String(e.from),
            target: String(e.to),
            label: e.condition || undefined,
            animated: true,
          }));
          setEdges(rfEdges);
        }
      } else {
        // Default nodes
        const defaultNodes: RfNode[] = [
          { id: '1', type: 'enrichment', data: { label: 'AI Enrichment', properties: {} }, position: { x: 100, y: 100 } },
          { id: '2', type: 'condition', data: { label: 'Branch Check', properties: { condition_field: 'company_size', condition_operator: '>', condition_value: '100' } }, position: { x: 300, y: 100 } },
          { id: '3', type: 'send_email', data: { label: 'Email Outreach', properties: { subject: 'Hi {{contact_name}}', body: 'We saw you are from {{company_name}}!' } }, position: { x: 550, y: 50 } },
          { id: '4', type: 'sales_action', data: { label: 'Update CRM Stage', properties: { action_type: 'update_stage', stage: 'Engaged' } }, position: { x: 550, y: 250 } },
        ];
        const defaultEdges: RfEdge[] = [
          { id: 'e1-2', source: '1', target: '2', animated: true },
          { id: 'e2-3', source: '2', target: '3', label: 'true', animated: true },
          { id: 'e2-4', source: '2', target: '4', label: 'false', animated: true },
        ];
        setNodes(defaultNodes);
        setEdges(defaultEdges);
        syncToTextarea(defaultNodes, defaultEdges);
      }
    } catch (e) {
      console.error('Failed to load initial graph JSON:', e);
    }
  }, []);

  // Handle connects
  const onConnect = useCallback((connection: Connection) => {
    let label: string | undefined;
    const sourceNode = nodes.find(n => n.id === connection.source);
    if (sourceNode?.type === 'condition') {
      label = prompt('Enter condition label for this branch (e.g. true / false):') || 'true';
    }

    setEdges((eds) => {
      const nextEds = rfAddEdge({ ...connection, label, animated: true }, eds);
      syncToTextarea(nodes, nextEds);
      return nextEds;
    });
  }, [nodes, setEdges]);

  // Handle dragging/moving nodes
  const onNodeDragStop = useCallback(() => {
    syncToTextarea(nodes, edges);
  }, [nodes, edges]);

  // Selected node callback
  const onNodeClick = useCallback((_: any, node: RfNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const addNode = (type: string) => {
    const newId = String(Date.now());
    const labelMap: Record<string, string> = {
      enrichment: 'AI Enrichment',
      condition: 'Branch Check',
      send_email: 'Email Outreach',
      intent: 'Intent Analysis',
      sales_action: 'Update CRM Stage',
    };

    const defaultProps: Record<string, any> = {
      enrichment: {},
      condition: { condition_field: 'company_size', condition_operator: '>', condition_value: '100' },
      send_email: { subject: 'Quick question for {{contact_name}}', body: 'Hi {{contact_name}}' },
      intent: { intent_expected: 'positive' },
      sales_action: { action_type: 'update_stage', stage: 'Engaged' },
    };

    const newNode: RfNode = {
      id: newId,
      type,
      data: { label: labelMap[type] || 'New Node', properties: defaultProps[type] || {} },
      position: { x: 150, y: 150 },
    };

    setNodes(prev => {
      const next = [...prev, newNode];
      syncToTextarea(next, edges);
      return next;
    });
    setSelectedNodeId(newId);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => {
      const nextNodes = prev.filter(n => n.id !== id);
      setEdges(eds => {
        const nextEds = eds.filter(e => e.source !== id && e.target !== id);
        syncToTextarea(nextNodes, nextEds);
        return nextEds;
      });
      return nextNodes;
    });
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const updateNodeProperty = (nodeId: string, key: string, value: any) => {
    setNodes(prev => {
      const next = prev.map(n => {
        if (n.id === nodeId) {
          const props = { ...(n.data?.properties || {}), [key]: value };
          return { ...n, data: { ...n.data, properties: props } };
        }
        return n;
      });
      syncToTextarea(next, edges);
      return next;
    });
  };

  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes(prev => {
      const next = prev.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, label } };
        }
        return n;
      });
      syncToTextarea(next, edges);
      return next;
    });
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 shadow-sm flex flex-col lg:flex-row h-[700px]">

      {/* 1. NODE SELECTOR SIDEBAR (LEFT) */}
      <div className="w-full lg:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">1. Add Action Nodes</h3>
            <p className="text-[11px] text-zinc-500 mb-3 font-medium">Click any node below to place it into the React Flow canvas.</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => addNode('enrichment')}
              className="w-full text-left p-3 rounded-lg border border-purple-100 hover:border-purple-300 dark:border-purple-950 dark:hover:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              <span>✨ AI Enrichment Node</span>
            </button>

            <button
              type="button"
              onClick={() => addNode('condition')}
              className="w-full text-left p-3 rounded-lg border border-amber-100 hover:border-amber-300 dark:border-amber-950 dark:hover:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>⚖️ Branching Condition Node</span>
            </button>

            <button
              type="button"
              onClick={() => addNode('send_email')}
              className="w-full text-left p-3 rounded-lg border border-indigo-100 hover:border-indigo-300 dark:border-indigo-950 dark:hover:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>✉️ Send Email Outreach Node</span>
            </button>

            <button
              type="button"
              onClick={() => addNode('intent')}
              className="w-full text-left p-3 rounded-lg border border-pink-100 hover:border-pink-300 dark:border-pink-950 dark:hover:border-pink-900 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span>🧠 Intent Detection Node</span>
            </button>

            <button
              type="button"
              onClick={() => addNode('sales_action')}
              className="w-full text-left p-3 rounded-lg border border-emerald-100 hover:border-emerald-300 dark:border-emerald-950 dark:hover:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>💼 Sales CRM Action Node</span>
            </button>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2">Instructions</div>
          <div className="text-[10px] text-zinc-500 space-y-1 leading-relaxed">
            <p>• Drag nodes to arrange them.</p>
            <p>• Click and drag from one node handle to another to create connections.</p>
            <p>• Click on any card to edit its properties.</p>
          </div>
        </div>
      </div>

      {/* 2. VISUAL CANVAS GRAPH AREA (CENTER - REACT FLOW) */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* 3. NODE PROPERTIES SIDEBAR (RIGHT) */}
      <div className="w-full lg:w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-4 space-y-4 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">2. Node Properties Config</h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-lg">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Selected Node:</span>
                <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 capitalize">{selectedNode.type} Node (ID: {selectedNode.id})</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Node Title</label>
                <input
                  type="text"
                  value={selectedNode.data?.label || ''}
                  onChange={e => updateNodeLabel(selectedNode.id, e.target.value)}
                  className="w-full text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              {/* Render Specific Node Properties Editors */}
              {selectedNode.type === 'condition' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Condition Field</label>
                    <input
                      type="text"
                      value={selectedNode.data?.properties?.condition_field || 'company_size'}
                      onChange={e => updateNodeProperty(selectedNode.id, 'condition_field', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Operator</label>
                    <select
                      value={selectedNode.data?.properties?.condition_operator || '>'}
                      onChange={e => updateNodeProperty(selectedNode.id, 'condition_operator', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                    >
                      <option value=">">&gt; Greater Than</option>
                      <option value="<">&lt; Less Than</option>
                      <option value="==">== Equal To</option>
                      <option value="!=">!= Not Equal</option>
                      <option value="contains">Contains Substring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Condition Value</label>
                    <input
                      type="text"
                      value={selectedNode.data?.properties?.condition_value || '100'}
                      onChange={e => updateNodeProperty(selectedNode.id, 'condition_value', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'send_email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Email Subject</label>
                    <input
                      type="text"
                      value={selectedNode.data?.properties?.subject || ''}
                      placeholder="e.g. Quick question for {{contact_name}}"
                      onChange={e => updateNodeProperty(selectedNode.id, 'subject', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Email Body Reference</label>
                    <textarea
                      rows={6}
                      value={selectedNode.data?.properties?.body || ''}
                      placeholder="Is {{company_name}} looking for a solution?"
                      onChange={e => updateNodeProperty(selectedNode.id, 'body', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 font-mono leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'sales_action' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Action Type</label>
                    <select
                      value={selectedNode.data?.properties?.action_type || 'update_stage'}
                      onChange={e => updateNodeProperty(selectedNode.id, 'action_type', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                    >
                      <option value="update_stage">Update Prospect Stage</option>
                      <option value="update_status">Update Prospect Status</option>
                    </select>
                  </div>
                  {selectedNode.data?.properties?.action_type !== 'update_status' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Target Stage</label>
                      <select
                        value={selectedNode.data?.properties?.stage || 'Engaged'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'stage', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      >
                        <option value="New">New</option>
                        <option value="Researching">Researching</option>
                        <option value="Ready to Contact">Ready to Contact</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Engaged">Engaged</option>
                        <option value="Connected">Connected</option>
                        <option value="Converted">Converted</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Target Status</label>
                      <select
                        value={selectedNode.data?.properties?.status || 'active'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'status', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      >
                        <option value="new">new</option>
                        <option value="active">active</option>
                        <option value="qualified">qualified</option>
                        <option value="junk">junk</option>
                        <option value="paused">paused</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {selectedNode.type === 'intent' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Expected Intent</label>
                    <select
                      value={selectedNode.data?.properties?.intent_expected || 'positive'}
                      onChange={e => updateNodeProperty(selectedNode.id, 'intent_expected', e.target.value)}
                      className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                    >
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedNode.type === 'enrichment' && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500">
                  This enrichment node leverages AI to automatically query sales intelligence APIs and lookup company domain information (such as company size, country, industry).
                </div>
              )}

            </div>
          ) : (
            <div className="text-center text-zinc-400 text-xs py-12">
              Click on any node in the React Flow canvas to configure its settings.
            </div>
          )}
        </div>

        {selectedNode && (
          <button
            type="button"
            onClick={() => deleteNode(selectedNode.id)}
            className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900 transition mt-4"
          >
            Delete Selected Node
          </button>
        )}
      </div>

    </div>
  );
}

// Mount React component to DOM
if (typeof document !== 'undefined') {
  const container = document.getElementById('workflow-visual-builder-root');
  if (container) {
    const root = createRoot(container);
    root.render(<VisualWorkflowBuilder />);
  }
}
