import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

interface Node {
  id: string;
  type: string;
  label?: string;
  properties?: Record<string, any>;
}

interface Edge {
  from: string;
  to: string;
  condition?: string;
}

export default function VisualBuilder() {
  // Read initial graph from window or fallback to default template
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const existingInput = document.getElementById('graph') as HTMLTextAreaElement;
      if (existingInput && existingInput.value) {
        const parsed = JSON.parse(existingInput.value);
        if (parsed.nodes) {
          setNodes(parsed.nodes);
        }
        if (parsed.edges) {
          setEdges(parsed.edges);
        }
      } else {
        // Default template
        setNodes([
          { id: '1', type: 'enrichment', label: 'AI Enrichment', properties: {} },
          { id: '2', type: 'condition', label: 'Branching Check', properties: { condition_field: 'company_size', condition_operator: '>', condition_value: '100' } },
          { id: '3', type: 'send_email', label: 'Send Email Outreach', properties: { subject: 'Hey {{contact_name}}', body: 'We saw you are from {{company_name}}!' } },
          { id: '4', type: 'sales_action', label: 'Sales Status Update', properties: { action_type: 'update_stage', stage: 'Engaged' } },
        ]);
        setEdges([
          { from: '1', to: '2' },
          { from: '2', to: '3', condition: 'true' },
          { from: '2', to: '4', condition: 'false' },
        ]);
      }
    } catch (e) {
      console.error('Failed to parse initial graph JSON:', e);
    }
  }, []);

  // Sync to parent textarea whenever nodes or edges change
  useEffect(() => {
    const textarea = document.getElementById('graph') as HTMLTextAreaElement;
    if (textarea) {
      const graphData = { nodes, edges };
      textarea.value = JSON.stringify(graphData, null, 2);
    }
  }, [nodes, edges]);

  const addNode = (type: string) => {
    const newId = String(Date.now());
    const labelMap: Record<string, string> = {
      enrichment: 'AI Enrichment Node',
      condition: 'Branch Check Node',
      send_email: 'Email Dispatch Node',
      intent: 'Intent Analysis Node',
      sales_action: 'Sales CRM Action Node',
    };

    const defaultProps: Record<string, any> = {
      enrichment: {},
      condition: { condition_field: 'company_size', condition_operator: '>', condition_value: '100' },
      send_email: { subject: 'Follow up', body: 'Hi {{contact_name}}' },
      intent: { intent_expected: 'positive' },
      sales_action: { action_type: 'update_stage', stage: 'Engaged' },
    };

    const newNode: Node = {
      id: newId,
      type,
      label: labelMap[type] || 'Custom Node',
      properties: defaultProps[type] || {},
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => fNodeId(n) !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const fNodeId = (n: Node) => String(n.id);

  const addEdge = (fromId: string, toId: string, condition?: string) => {
    if (fromId === toId) return;
    // Avoid duplicate edges
    const exists = edges.some(e => e.from === fromId && e.to === toId);
    if (exists) return;

    const newEdge: Edge = { from: fromId, to: toId };
    if (condition) {
      newEdge.condition = condition;
    }
    setEdges(prev => [...prev, newEdge]);
  };

  const removeEdge = (index: number) => {
    setEdges(prev => prev.filter((_, i) => i !== index));
  };

  const updateNodeProperty = (nodeId: string, key: string, value: any) => {
    setNodes(prev =>
      prev.map(n => {
        if (fNodeId(n) === nodeId) {
          return {
            ...n,
            properties: {
              ...(n.properties || {}),
              [key]: value,
            },
          };
        }
        return n;
      })
    );
  };

  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (fNodeId(n) === nodeId) {
          return { ...n, label };
        }
        return n;
      })
    );
  };

  const selectedNode = nodes.find(n => fNodeId(n) === selectedNodeId);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 shadow-sm flex flex-col lg:flex-row h-[700px]">

      {/* 1. NODE SELECTOR SIDEBAR (LEFT) */}
      <div className="w-full lg:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">1. Add Action Nodes</h3>
            <p className="text-[11px] text-zinc-500 mb-3">Click any node below to place it into the execution flow canvas.</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => addNode('enrichment')}
              className="w-full text-left p-3 rounded-lg border border-purple-100 hover:border-purple-300 dark:border-purple-950 dark:hover:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
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
          <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2">Node Connections ({edges.length})</div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {edges.map((edge, index) => {
              const srcNode = nodes.find(n => fNodeId(n) === edge.from);
              const destNode = nodes.find(n => fNodeId(n) === edge.to);
              return (
                <div key={index} className="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 px-2 py-1 rounded">
                  <span className="truncate max-w-[120px]" title={`${srcNode?.label || 'Node'} -> ${destNode?.label || 'Node'}`}>
                    {srcNode?.label || edge.from} &rarr; {destNode?.label || edge.to}
                    {edge.condition && <span className="text-[9px] text-amber-600 font-semibold ml-1">({edge.condition})</span>}
                  </span>
                  <button type="button" onClick={() => removeEdge(index)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. VISUAL CANVAS GRAPH AREA (CENTER) */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">2. Node Execution flow Canvas</h3>
          <p className="text-[11px] text-zinc-500">Configure connections and click cards to modify properties.</p>
        </div>

        {/* Node Cards Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
          {nodes.map(node => {
            const isSelected = selectedNodeId === fNodeId(node);
            const borderColors: Record<string, string> = {
              enrichment: 'border-purple-200 dark:border-purple-900/60',
              condition: 'border-amber-200 dark:border-amber-900/60',
              send_email: 'border-indigo-200 dark:border-indigo-900/60',
              intent: 'border-pink-200 dark:border-pink-900/60',
              sales_action: 'border-emerald-200 dark:border-emerald-900/60',
            };

            const headerColors: Record<string, string> = {
              enrichment: 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400',
              condition: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
              send_email: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400',
              intent: 'bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-400',
              sales_action: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
            };

            const nodeEdges = edges.filter(e => e.from === fNodeId(node));

            return (
              <div
                key={fNodeId(node)}
                onClick={() => setSelectedNodeId(fNodeId(node))}
                className={`cursor-pointer rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow transition-all ${
                  isSelected ? 'ring-2 ring-indigo-500 border-transparent' : borderColors[node.type] || 'border-zinc-200'
                }`}
              >
                {/* Card Header */}
                <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 ${headerColors[node.type]}`}>
                  <span className="capitalize">{node.type.replace('_', ' ')} Node</span>
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => deleteNode(fNodeId(node))}
                      className="text-red-500 hover:text-red-700 bg-white dark:bg-zinc-850 p-1 rounded border border-red-100 dark:border-red-950 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={node.label || ''}
                      onChange={e => updateNodeLabel(fNodeId(node), e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-full text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-none bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Connect Out Panel */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Connect to</span>
                    <select
                      onChange={e => {
                        const targetId = e.target.value;
                        if (targetId) {
                          let cond: string | undefined;
                          if (node.type === 'condition') {
                            cond = prompt('Enter condition value for this connection (e.g., true, false):') || 'true';
                          }
                          addEdge(fNodeId(node), targetId, cond);
                          e.target.value = ''; // reset selection
                        }
                      }}
                      className="text-[10px] rounded border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 py-1"
                    >
                      <option value="">-- select target --</option>
                      {nodes
                        .filter(n => fNodeId(n) !== fNodeId(node))
                        .map(n => (
                          <option key={fNodeId(n)} value={fNodeId(n)}>
                            {n.label || `${n.type} (#${n.id})`}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Existing Outputs list */}
                  {nodeEdges.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {nodeEdges.map((edge, i) => {
                        const dest = nodes.find(n => fNodeId(n) === edge.to);
                        return (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            &rarr; {dest?.label || edge.to}
                            {edge.condition && ` (${edge.condition})`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NODE PROPERTIES SIDEBAR (RIGHT) */}
      <div className="w-full lg:w-72 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">3. Node Properties Config</h3>
        </div>

        {selectedNode ? (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-lg">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Selected:</span>
              <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 capitalize">{selectedNode.type} Node</span>
            </div>

            {/* Render Specific Node Properties Editors */}
            {selectedNode.type === 'condition' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Condition Field</label>
                  <input
                    type="text"
                    value={selectedNode.properties?.condition_field || 'company_size'}
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'condition_field', e.target.value)}
                    className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Operator</label>
                  <select
                    value={selectedNode.properties?.condition_operator || '>'}
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'condition_operator', e.target.value)}
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
                    value={selectedNode.properties?.condition_value || '100'}
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'condition_value', e.target.value)}
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
                    value={selectedNode.properties?.subject || ''}
                    placeholder="e.g. Quick question for {{contact_name}}"
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'subject', e.target.value)}
                    className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Email Body Reference</label>
                  <textarea
                    rows={6}
                    value={selectedNode.properties?.body || ''}
                    placeholder="Is {{company_name}} looking for a solution?"
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'body', e.target.value)}
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
                    value={selectedNode.properties?.action_type || 'update_stage'}
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'action_type', e.target.value)}
                    className="mt-1 block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                  >
                    <option value="update_stage">Update Prospect Stage</option>
                    <option value="update_status">Update Prospect Status</option>
                  </select>
                </div>
                {selectedNode.properties?.action_type !== 'update_status' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Target Stage</label>
                    <select
                      value={selectedNode.properties?.stage || 'Engaged'}
                      onChange={e => updateNodeProperty(fNodeId(selectedNode), 'stage', e.target.value)}
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
                      value={selectedNode.properties?.status || 'active'}
                      onChange={e => updateNodeProperty(fNodeId(selectedNode), 'status', e.target.value)}
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
                    value={selectedNode.properties?.intent_expected || 'positive'}
                    onChange={e => updateNodeProperty(fNodeId(selectedNode), 'intent_expected', e.target.value)}
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
            Click on any node in the canvas to configure its settings.
          </div>
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
    root.render(<VisualBuilder />);
  }
}
