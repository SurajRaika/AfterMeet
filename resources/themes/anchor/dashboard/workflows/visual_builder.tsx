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

  const templates = (window as any).templatesList || [];

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
        // Default nodes representing an intelligent multi-branching sales intent agent
        const defaultNodes: RfNode[] = [
          { id: '1', type: 'enrichment', data: { label: 'AI Enrichment', properties: {} }, position: { x: 50, y: 150 } },
          { id: '2', type: 'send_email', data: { label: 'First Outreach Email', properties: { subject: 'Quick question for {{contact_name}}', body: 'Hi {{contact_name}}, is {{company_name}} looking for a solution?' } }, position: { x: 250, y: 150 } },
          { id: '3', type: 'intent', data: { label: 'Reply Intent Analysis', properties: { stages: [ { name: 'book_call', description: 'Prospect is interested and wants to schedule a call or meet.' }, { name: 'not_now', description: 'Prospect is busy, out of office, or wants to connect later.' }, { name: 'unsubscribed', description: 'Prospect declined, said stop, or unsubscribe.' } ], extra_context: 'Identify direct action requests like schedule/meeting as book_call' } }, position: { x: 450, y: 150 } },
          { id: '4', type: 'sales_action', data: { label: 'Mark as Converted', properties: { action_type: 'update_stage', stage: 'Converted' } }, position: { x: 700, y: 50 } },
          { id: '5', type: 'send_email', data: { label: 'Send Follow-up Email', properties: { subject: 'Follow up with {{contact_name}}', body: 'Hi {{contact_name}}, following up on our last message!' } }, position: { x: 700, y: 180 } },
          { id: '6', type: 'sales_action', data: { label: 'Mark as Junk/Paused', properties: { action_type: 'update_status', status: 'paused' } }, position: { x: 700, y: 310 } },
        ];
        const defaultEdges: RfEdge[] = [
          { id: 'e1-2', source: '1', target: '2', animated: true },
          { id: 'e2-3', source: '2', target: '3', animated: true },
          { id: 'e3-4', source: '3', target: '4', label: 'book_call', animated: true },
          { id: 'e3-5', source: '3', target: '5', label: 'not_now', animated: true },
          { id: 'e3-6', source: '3', target: '6', label: 'unsubscribed', animated: true },
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
      delay: 'Delay Node',
    };

    const defaultProps: Record<string, any> = {
      enrichment: {},
      condition: { condition_field: 'company_size', condition_operator: '>', condition_value: '100' },
      send_email: { subject: 'Quick question for {{contact_name}}', body: 'Hi {{contact_name}}' },
      intent: { intent_expected: 'positive' },
      sales_action: { action_type: 'update_stage', stage: 'Engaged' },
      delay: { wait_days: 2 },
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
              onClick={() => addNode('send_email')}
              className="w-full text-left p-3 rounded-lg border border-indigo-100 hover:border-indigo-300 dark:border-indigo-950 dark:hover:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>✉️ Send Email Outreach Node</span>
            </button>

            <button
              type="button"
              onClick={() => addNode('delay')}
              className="w-full text-left p-3 rounded-lg border border-sky-100 hover:border-sky-300 dark:border-sky-950 dark:hover:border-sky-900 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 font-semibold text-xs flex items-center gap-2.5 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>⏱️ Delay / Wait Node</span>
            </button>

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

      {/* 3. N8N-STYLE NODE INSPECTOR SIDEBAR (RIGHT) */}
      <div className="w-full lg:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-4 space-y-4 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">n8n Node Inspector</h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-850">

              {/* Node Overview Header */}
              <div className="pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">Selected Node:</span>
                  <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 capitalize">{selectedNode.type} Node (ID: {selectedNode.id})</span>
                </div>
                <input
                  type="text"
                  value={selectedNode.data?.label || ''}
                  onChange={e => updateNodeLabel(selectedNode.id, e.target.value)}
                  className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-950 max-w-[120px]"
                />
              </div>

              {/* SECTION A: INPUT DATA (n8n-style) */}
              <div className="pt-3 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  📥 Input Section (Data Received)
                </span>
                <p className="text-[10px] text-zinc-400 mb-2">The runtime execution keys accessible from preceding scope:</p>
                <pre className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded border border-zinc-150 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 max-h-32 overflow-y-auto leading-tight">
                  {selectedNode.type === 'enrichment' ? (
                    JSON.stringify({
                      contact_name: "Jane Smith",
                      contact_email: "janesmith@acme.com",
                      company_name: "Acme Inc",
                      tenant_id: 1
                    }, null, 2)
                  ) : selectedNode.type === 'send_email' ? (
                    JSON.stringify({
                      contact_name: "Jane Smith",
                      company_name: "Acme Inc",
                      company_size: "500",
                      industry: "software",
                      enriched_by: "AI Enrichment",
                      tenant_id: 1
                    }, null, 2)
                  ) : selectedNode.type === 'intent' ? (
                    JSON.stringify({
                      contact_name: "Jane Smith",
                      company_name: "Acme Inc",
                      company_size: "500",
                      industry: "software",
                      sent: true,
                      recipient: "janesmith@acme.com",
                      subject: "Quick question for Jane Smith",
                      message_id: "workflow-msg-1234",
                      email_body: "Yes, we schedule a call next Tuesday!"
                    }, null, 2)
                  ) : selectedNode.type === 'sales_action' ? (
                    JSON.stringify({
                      contact_name: "Jane Smith",
                      company_name: "Acme Inc",
                      intent: "book_call",
                      confidence_score: 0.95,
                      tenant_id: 1
                    }, null, 2)
                  ) : (
                    JSON.stringify({
                      contact_name: "Jane Smith",
                      company_name: "Acme Inc",
                      tenant_id: 1
                    }, null, 2)
                  )}
                </pre>
              </div>

              {/* SECTION B: ACTION / BUSINESS LOGIC (n8n-style) */}
              <div className="pt-3 pb-3 space-y-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  ⚙️ Processing & Business Logic
                </span>

                {selectedNode.type === 'condition' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500">Condition Field</label>
                      <input
                        type="text"
                        value={selectedNode.data?.properties?.condition_field || 'company_size'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'condition_field', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500">Operator</label>
                      <select
                        value={selectedNode.data?.properties?.condition_operator || '>'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'condition_operator', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      >
                        <option value=">">&gt; Greater Than</option>
                        <option value="<">&lt; Less Than</option>
                        <option value="==">== Equal To</option>
                        <option value="!=">!= Not Equal</option>
                        <option value="contains">Contains Substring</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500">Condition Value</label>
                      <input
                        type="text"
                        value={selectedNode.data?.properties?.condition_value || '100'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'condition_value', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-355 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'send_email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500">Associate Real Template</label>
                      <select
                        value={selectedNode.data?.properties?.template_id || ''}
                        onChange={e => updateNodeProperty(selectedNode.id, 'template_id', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 cursor-pointer font-medium"
                      >
                        <option value="">-- No Template (Custom subject/body below) --</option>
                        {templates.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!selectedNode.data?.properties?.template_id ? (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500">Email Subject</label>
                          <input
                            type="text"
                            value={selectedNode.data?.properties?.subject || ''}
                            placeholder="e.g. Quick question for {{contact_name}}"
                            onChange={e => updateNodeProperty(selectedNode.id, 'subject', e.target.value)}
                            className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500">Email Body Reference</label>
                          <textarea
                            rows={4}
                            value={selectedNode.data?.properties?.body || ''}
                            placeholder="Is {{company_name}} looking for a solution?"
                            onChange={e => updateNodeProperty(selectedNode.id, 'body', e.target.value)}
                            className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 font-mono leading-relaxed resize-none"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-lg text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        Personalized email template selected. Variables like contact_name and company_name will be parsed automatically from real data on dispatch.
                      </div>
                    )}
                  </div>
                )}

                {selectedNode.type === 'delay' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500">Wait Delay (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={selectedNode.data?.properties?.wait_days || '2'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'wait_days', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'sales_action' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500">Action Type</label>
                      <select
                        value={selectedNode.data?.properties?.action_type || 'update_stage'}
                        onChange={e => updateNodeProperty(selectedNode.id, 'action_type', e.target.value)}
                        className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
                      >
                        <option value="update_stage">Update Prospect Stage</option>
                        <option value="update_status">Update Prospect Status</option>
                      </select>
                    </div>
                    {selectedNode.data?.properties?.action_type !== 'update_status' ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500">Target Stage</label>
                        <select
                          value={selectedNode.data?.properties?.stage || 'Engaged'}
                          onChange={e => updateNodeProperty(selectedNode.id, 'stage', e.target.value)}
                          className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
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
                        <label className="block text-[11px] font-semibold text-zinc-500">Target Status</label>
                        <select
                          value={selectedNode.data?.properties?.status || 'active'}
                          onChange={e => updateNodeProperty(selectedNode.id, 'status', e.target.value)}
                          className="mt-1 block w-full rounded border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2"
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">AI Prompt Extra Context</label>
                      <textarea
                        rows={3}
                        value={selectedNode.data?.properties?.extra_context || ''}
                        placeholder="e.g. Prioritize scheduling calls. Ignore signature footers."
                        onChange={e => updateNodeProperty(selectedNode.id, 'extra_context', e.target.value)}
                        className="block w-full rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs py-1.5 px-2 font-mono"
                      />
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-zinc-500">Stages & Descriptions</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentStages = selectedNode.data?.properties?.stages || [
                              { name: 'positive', description: 'Prospect shows positive interest or wants to connect.' },
                              { name: 'negative', description: 'Prospect declined, said stop, or unsubscribe.' },
                              { name: 'neutral', description: 'Automated, out of office, or indifferent replies.' }
                            ];
                            const name = prompt('Enter custom stage name (e.g. book_call):') || '';
                            if (name) {
                              const description = prompt('Enter stage matching description for AI agent:') || '';
                              updateNodeProperty(selectedNode.id, 'stages', [...currentStages, { name, description }]);
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          + Add Stage
                        </button>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {(selectedNode.data?.properties?.stages || [
                          { name: 'positive', description: 'Prospect shows positive interest or wants to connect.' },
                          { name: 'negative', description: 'Prospect declined, said stop, or unsubscribe.' },
                          { name: 'neutral', description: 'Automated, out of office, or indifferent replies.' }
                        ]).map((stage: any, sIdx: number) => (
                          <div key={sIdx} className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-850 space-y-1 relative group">
                            <button
                              type="button"
                              onClick={() => {
                                const currentStages = selectedNode.data?.properties?.stages || [
                                  { name: 'positive', description: 'Prospect shows positive interest or wants to connect.' },
                                  { name: 'negative', description: 'Prospect declined, said stop, or unsubscribe.' },
                                  { name: 'neutral', description: 'Automated, out of office, or indifferent replies.' }
                                ];
                                updateNodeProperty(selectedNode.id, 'stages', currentStages.filter((_: any, i: number) => i !== sIdx));
                              }}
                              className="absolute right-2 top-1 text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              ×
                            </button>
                            <div className="font-semibold text-[10px] text-zinc-700 dark:text-zinc-300">Stage: {stage.name}</div>
                            <div className="text-[10px] text-zinc-500 truncate" title={stage.description}>{stage.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'enrichment' && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500">
                    This enrichment node leverages AI to automatically query sales intelligence APIs and lookup company domain information (such as company size, country, industry).
                  </div>
                )}
              </div>

              {/* SECTION C: OUTPUT DATA (n8n-style) */}
              <div className="pt-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  📤 Output Section (Data Produced)
                </span>
                <p className="text-[10px] text-zinc-400 mb-2">The key-values produced by this node upon successful execution:</p>
                <pre className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded border border-zinc-150 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 max-h-32 overflow-y-auto leading-tight">
                  {selectedNode.type === 'enrichment' ? (
                    JSON.stringify({
                      company_size: "500",
                      industry: "software",
                      enriched_by: "AI Enrichment",
                      enriched: true
                    }, null, 2)
                  ) : selectedNode.type === 'send_email' ? (
                    JSON.stringify({
                      sent: true,
                      recipient: "janesmith@acme.com",
                      subject: "Quick question for Jane Smith",
                      message_id: "workflow-msg-1234"
                    }, null, 2)
                  ) : selectedNode.type === 'intent' ? (
                    JSON.stringify({
                      intent: "book_call",
                      confidence_score: 0.95,
                      detected: true
                    }, null, 2)
                  ) : selectedNode.type === 'condition' ? (
                    JSON.stringify({
                      result: true,
                      checked_field: "company_size",
                      actual_value: "500"
                    }, null, 2)
                  ) : selectedNode.type === 'sales_action' ? (
                    JSON.stringify({
                      action_taken: "update_stage",
                      applied: true,
                      stage_applied: "Converted"
                    }, null, 2)
                  ) : (
                    JSON.stringify({
                      status: "success"
                    }, null, 2)
                  )}
                </pre>
              </div>

            </div>
          ) : (
            <div className="text-center text-zinc-400 text-xs py-12">
              Click on any node in the React Flow canvas to inspect or configure its input, processing, and output sections.
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
