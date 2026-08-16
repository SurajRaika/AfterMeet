import React from 'react';

// ==========================================
// 1. DASHBOARD SALES VIEW
// ==========================================
export function DashSalesView() {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Trade Dashboard</h1>
        <p className="text-neutral-500 text-[10px]">Pipeline funnels and metrics reserved for Sales Management.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-[10px]">
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[9px] uppercase font-bold">Active Funnel Value</span>
          <p className="text-base font-black text-neutral-900 mt-1">$412,500</p>
          <p className="text-[9px] text-emerald-600 mt-0.5">↑ +14% Target variance</p>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[9px] uppercase font-bold">Win Latency</span>
          <p className="text-base font-black text-neutral-900 mt-1">11.4 Days</p>
          <p className="text-[9px] text-neutral-500 mt-0.5">Prospect initialization to PO signing</p>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[9px] uppercase font-bold">Sales Target Match</span>
          <p className="text-base font-black text-neutral-900 mt-1">88.2%</p>
          <p className="text-[9px] text-neutral-500 mt-0.5">Completed quarterly quotas</p>
        </div>
      </div>
    </div>
  );
}

import { Enquiry, User } from '../../types/crm';

interface DashCostingViewProps {
  enquiries?: Enquiry[];
  currentUser?: User;
  triggerToast?: (msg: string) => void;
  handleAssignCostingRequest?: (enquiryId: string, assigneeName: string) => void;
  handleApproveCostingRequest?: (enquiryId: string, baseCost: number, logistics: number, margin: number) => void;
  handleRejectCostingRequest?: (enquiryId: string, note: string) => void;
}

// ==========================================
// 2. DASHBOARD COSTING VIEW
// ==========================================
export function DashCostingView({
  enquiries = [],
  currentUser,
  triggerToast,
  handleAssignCostingRequest,
  handleApproveCostingRequest,
  handleRejectCostingRequest,
}: DashCostingViewProps) {
  // Safe default trigger
  const safeToast = triggerToast || ((m: string) => console.log(m));

  // Local state for management interactions
  const [selectedEnquiryId, setSelectedEnquiryId] = React.useState<string>('');
  const [rejectNote, setRejectNote] = React.useState<string>('');
  const [customBaseCost, setCustomBaseCost] = React.useState<string>('');
  const [customLogistics, setCustomLogistics] = React.useState<string>('');
  const [customMargin, setCustomMargin] = React.useState<string>('');

  // Sourcing list of all costing requests
  const requests = React.useMemo(() => {
    return enquiries.filter(e => e.costingRequest).map(e => ({
      enquiry: e,
      req: e.costingRequest!
    }));
  }, [enquiries]);

  // Compute Manager Metrics
  const metrics = React.useMemo(() => {
    const list = requests.map(r => r.req);
    const total = list.length;
    const pending = list.filter(r => r.status === 'Requested').length;
    const inProgress = list.filter(r => r.status === 'In Progress').length;
    const awaitingInfo = list.filter(r => r.status === 'Awaiting Inputs').length;
    const readyReview = list.filter(r => r.status === 'Ready for Review').length;
    const completed = list.filter(r => r.status === 'Approved').length;

    // Overdue check
    const overdue = list.filter(r => {
      const due = new Date(r.dueDate);
      return due < new Date() && r.status !== 'Approved';
    }).length;

    // Average completion time (using dummy and seeded completion times)
    const completedList = list.filter(r => r.completionTime !== undefined);
    const avgTime = completedList.length > 0
      ? (completedList.reduce((sum, r) => sum + (r.completionTime || 0), 0) / completedList.length).toFixed(1)
      : '24.0';

    // Workload by employee
    const workload: Record<string, number> = {};
    list.forEach(r => {
      const name = r.assignee || 'Unassigned';
      workload[name] = (workload[name] || 0) + 1;
    });

    // Requests by priority
    const priorityCount = { High: 0, Medium: 0, Low: 0 };
    list.forEach(r => {
      if (r.priority === 'High') priorityCount.High++;
      else if (r.priority === 'Medium') priorityCount.Medium++;
      else if (r.priority === 'Low') priorityCount.Low++;
    });

    // Bottlenecks
    const bottlenecks: string[] = [];
    if (awaitingInfo > 0) bottlenecks.push(`${awaitingInfo} request(s) blocked awaiting third-party department input`);
    if (overdue > 0) bottlenecks.push(`${overdue} task(s) exceeded target SLA delivery timelines`);
    if (readyReview > 0) bottlenecks.push(`${readyReview} pricing sheet(s) waiting in manager sign-off queue`);

    return {
      total,
      pending,
      inProgress,
      awaitingInfo,
      readyReview,
      overdue,
      completed,
      avgTime,
      workload,
      priorityCount,
      bottlenecks
    };
  }, [requests]);

  // Selected details
  const activeDetail = React.useMemo(() => {
    if (!selectedEnquiryId) return null;
    return requests.find(r => r.enquiry.id === selectedEnquiryId) || null;
  }, [requests, selectedEnquiryId]);

  // Autofill forms on detail selection
  React.useEffect(() => {
    if (activeDetail) {
      const totalComp = activeDetail.req.components.reduce((sum, c) => sum + c.cost, 0);
      setCustomBaseCost(activeDetail.req.components.find(c => c.name.toLowerCase().includes('procurement'))?.cost.toString() || '1200');
      setCustomLogistics(activeDetail.req.components.find(c => c.name.toLowerCase().includes('logistics'))?.cost.toString() || '250');
      setCustomMargin('150');
    }
  }, [activeDetail]);

  return (
    <div className="space-y-4">
      {/* Header Context Bar */}
      <div className="border-b pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase">Costing Department Manager Dashboard</h1>
          <p className="text-neutral-500 text-[10px]">Strategic operations oversight, analyst load dispatching, and pricing sign-off controls.</p>
        </div>
        <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase">Management Terminal</span>
      </div>

      {/* Metric Scorecard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-[10px]">
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total Requests</span>
          <span className="text-sm font-black text-neutral-900">{metrics.total}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Pending</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.pending}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">In Progress</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.inProgress}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Awaiting Info</span>
          <span className="text-sm font-bold text-amber-600">{metrics.awaitingInfo}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Ready for Review</span>
          <span className="text-sm font-bold text-blue-600">{metrics.readyReview}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Overdue</span>
          <span className="text-sm font-bold text-red-600">{metrics.overdue}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Completed</span>
          <span className="text-sm font-bold text-emerald-600">{metrics.completed}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Avg Turnaround</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.avgTime} hrs</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-[10px]">

        {/* Analyst Workload Slices */}
        <div className="bg-white border p-3 space-y-2">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Analyst Sourcing Workload</span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {Object.entries(metrics.workload).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center py-1 border-b border-neutral-100">
                <span className="font-medium text-neutral-900">{name}</span>
                <span className="font-mono bg-neutral-100 px-1.5 py-0.2 border text-[9px]">{count} request(s)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priorities & Bottleneck Lists */}
        <div className="bg-white border p-3 space-y-2">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Requests by Priority</span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-50 border border-red-200 p-1.5 text-red-800">
              <span className="text-[8px] uppercase block">High</span>
              <strong className="text-xs font-mono">{metrics.priorityCount.High}</strong>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-1.5 text-amber-800">
              <span className="text-[8px] uppercase block">Medium</span>
              <strong className="text-xs font-mono">{metrics.priorityCount.Medium}</strong>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-1.5 text-blue-800">
              <span className="text-[8px] uppercase block">Low</span>
              <strong className="text-xs font-mono">{metrics.priorityCount.Low}</strong>
            </div>
          </div>
        </div>

        {/* Bottleneck Alerts */}
        <div className="bg-white border p-3 space-y-2">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">System Bottleneck Triggers</span>
          {metrics.bottlenecks.length === 0 ? (
            <p className="text-emerald-600 italic text-center py-4">Zero system bottlenecks detected. Clean operations.</p>
          ) : (
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {metrics.bottlenecks.map((b, i) => (
                <div key={i} className="bg-red-50 text-red-900 border border-red-200 p-2 text-[9px]">
                  ⚠️ {b}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Main Execution and Verification List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left Side: Requests list */}
        <div className="bg-white border p-3 space-y-2 text-[10px]">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Enquiry Pipeline Costings</span>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {requests.map(({ enquiry, req }) => {
              const isSelected = enquiry.id === selectedEnquiryId;
              return (
                <div
                  key={enquiry.id}
                  onClick={() => setSelectedEnquiryId(enquiry.id)}
                  className={`p-2 border cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-950 text-white border-neutral-950' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong className="font-mono">{enquiry.id}</strong>
                    <span className={`px-1.5 py-0.2 text-[8px] uppercase font-bold border ${
                      isSelected ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-neutral-800 border-neutral-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="truncate font-medium">{enquiry.customerName}</p>
                  <p className="text-[9px] opacity-80 truncate">{enquiry.product}</p>
                  <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-dashed border-neutral-300 opacity-90 text-[8px]">
                    <span>Analyst: {req.assignee || 'Unassigned'}</span>
                    <span>Due: {req.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Request Verification, Assignment & Approval Tools */}
        <div className="lg:col-span-2 bg-white border p-4 text-[10px] space-y-4">
          {!activeDetail ? (
            <div className="text-center py-12 text-neutral-500 italic">
              Please select a costing record from the left list to initiate management assignment, revision, or final approval.
            </div>
          ) : (
            <div className="space-y-4">

              {/* Header Context */}
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-neutral-950 uppercase">Manager Action Desk &bull; {activeDetail.enquiry.id}</h3>
                  <p className="text-neutral-500 text-[10px]">
                    Customer: <strong className="text-neutral-800">{activeDetail.enquiry.customerName}</strong> &bull; Product: <strong className="text-neutral-800">{activeDetail.enquiry.product}</strong>
                  </p>
                </div>
                <span className={`px-2 py-0.5 font-mono text-[8px] font-bold border uppercase ${
                  activeDetail.req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {activeDetail.req.status}
                </span>
              </div>

              {/* Scope Notes */}
              <div className="bg-neutral-50 p-2 border">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block mb-1">Cost Specification Details</span>
                <p className="text-neutral-800 italic">"{activeDetail.req.salesNote}"</p>
              </div>

              {/* Assignment Controls */}
              <div className="border p-3 space-y-2 bg-neutral-50">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Assign / Reassign Task</span>
                <div className="flex gap-2">
                  <select
                    id="assigneeSelect"
                    defaultValue={activeDetail.req.assignee || ''}
                    className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                  >
                    <option value="">Unassigned</option>
                    <option value="Tom Harris">Tom Harris [Costing Desk Analyst]</option>
                    <option value="Sarah Jenkins">Sarah Jenkins [Costing Department Head]</option>
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById('assigneeSelect') as HTMLSelectElement;
                      if (handleAssignCostingRequest && sel) {
                        handleAssignCostingRequest(activeDetail.enquiry.id, sel.value);
                      } else {
                        safeToast('Assignment handler not active.');
                      }
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase text-[8px] px-3 py-1"
                  >
                    Commit Assignment
                  </button>
                </div>
              </div>

              {/* Captured Cost components validation */}
              <div className="border p-3 space-y-2">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block border-b pb-1">Review captured components worksheet</span>
                {activeDetail.req.components.length === 0 ? (
                  <p className="text-neutral-500 italic">No cost elements have been recorded by the desk analyst yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {activeDetail.req.components.map(c => (
                      <div key={c.id} className="flex justify-between items-center py-1 bg-neutral-50 px-2 border">
                        <div>
                          <strong className="text-neutral-900">{c.name}</strong>
                          {c.notes && <span className="text-neutral-400 text-[8px] block">{c.notes}</span>}
                        </div>
                        <span className="font-bold font-mono text-neutral-950">${c.cost.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="flex justify-end font-bold text-[10px] pt-1 border-t font-mono">
                      Worksheet Subtotal: ${activeDetail.req.components.reduce((sum, c) => sum + c.cost, 0).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Structured internal requests checklist */}
              <div className="border p-3 space-y-2 bg-neutral-50">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block border-b pb-1">Inter-Departmental requests checklist</span>
                {activeDetail.req.internalRequests.length === 0 ? (
                  <p className="text-neutral-400 italic">No external tasks dispatched.</p>
                ) : (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {activeDetail.req.internalRequests.map(t => (
                      <div key={t.id} className="bg-white p-1.5 border flex justify-between items-center">
                        <div>
                          <span className="font-medium">{t.title} ({t.id})</span>
                          <span className="text-[8px] text-neutral-400 block">Dept: {t.department} &bull; Assigned: {t.assignee}</span>
                        </div>
                        <span className={`px-1 py-0.2 text-[8px] font-bold uppercase font-mono ${
                          t.status === 'Completed' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approval & Rejection Terminal Panel */}
              {activeDetail.req.status !== 'Approved' && (
                <div className="border-2 border-neutral-950 p-3 space-y-3">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-900 block border-b pb-1">Manager review decision center</span>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[8px] text-neutral-400 block uppercase mb-0.5">Approved Sourcing Base</label>
                      <input
                        type="number"
                        value={customBaseCost}
                        onChange={(e) => setCustomBaseCost(e.target.value)}
                        className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-neutral-400 block uppercase mb-0.5">Approved Logistics Factor</label>
                      <input
                        type="number"
                        value={customLogistics}
                        onChange={(e) => setCustomLogistics(e.target.value)}
                        className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-neutral-400 block uppercase mb-0.5">Margin Allocation</label>
                      <input
                        type="number"
                        value={customMargin}
                        onChange={(e) => setCustomMargin(e.target.value)}
                        className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-mono font-bold text-neutral-950">
                      Signing Sourcing total: ${(parseFloat(customBaseCost || '0') + parseFloat(customLogistics || '0') + parseFloat(customMargin || '0')).toLocaleString()} / MT
                    </span>
                    <button
                      onClick={() => {
                        const base = parseFloat(customBaseCost);
                        const log = parseFloat(customLogistics);
                        const marg = parseFloat(customMargin);
                        if (isNaN(base) || isNaN(log) || isNaN(marg)) {
                          safeToast('Provide valid decimal cost targets.');
                          return;
                        }
                        if (handleApproveCostingRequest) {
                          handleApproveCostingRequest(activeDetail.enquiry.id, base, log, marg);
                        } else {
                          safeToast('Approval handler is not linked.');
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase px-3 py-1.5 text-[9px]"
                    >
                      Sign & Approve Costing
                    </button>
                  </div>

                  <div className="border-t pt-2.5 space-y-1.5 text-[10px]">
                    <span className="text-neutral-400 block uppercase text-[8px]">Request Sheet Revision (Rejection Feedback)</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Sourcing price indexes too high, verify with other cooperatives"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => {
                          if (!rejectNote.trim()) {
                            safeToast('Please specify reason for revision request.');
                            return;
                          }
                          if (handleRejectCostingRequest) {
                            handleRejectCostingRequest(activeDetail.enquiry.id, rejectNote);
                            setRejectNote('');
                          } else {
                            safeToast('Rejection handler not active.');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[9px] px-3 py-1"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already Approved metrics details */}
              {activeDetail.req.approvedCosting && (
                <div className="border border-emerald-300 p-3 bg-emerald-50 text-emerald-900 space-y-2">
                  <span className="font-bold text-[9px] uppercase block">✓ Signed & Approved Costing Sheet Details</span>
                  <div className="grid grid-cols-4 gap-2 bg-white p-2 border border-emerald-100 text-neutral-800">
                    <div>
                      <span className="text-neutral-400 block text-[8px] uppercase">Base (FOB)</span>
                      <strong className="font-mono">${activeDetail.req.approvedCosting.baseCost.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[8px] uppercase">Logistics</span>
                      <strong className="font-mono">${activeDetail.req.approvedCosting.logistics.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[8px] uppercase">Margin</span>
                      <strong className="font-mono">${activeDetail.req.approvedCosting.margin.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 block text-[8px] uppercase font-bold">Total price</span>
                      <strong className="font-mono text-emerald-700">${activeDetail.req.approvedCosting.total.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

interface DashSamplingViewProps {
  enquiries?: Enquiry[];
  currentUser?: User;
  triggerToast?: (msg: string) => void;
  handleAssignSamplingRequest?: (enquiryId: string, assigneeName: string) => void;
  handleApproveSamplingRequest?: (enquiryId: string) => void;
  handleRejectSamplingRequest?: (enquiryId: string, note: string) => void;
}

// ==========================================
// 3. DASHBOARD SAMPLING VIEW
// ==========================================
export function DashSamplingView({
  enquiries = [],
  currentUser,
  triggerToast,
  handleAssignSamplingRequest,
  handleApproveSamplingRequest,
  handleRejectSamplingRequest,
}: DashSamplingViewProps) {
  const safeToast = triggerToast || ((m: string) => console.log(m));
  const [selectedEnquiryId, setSelectedEnquiryId] = React.useState<string>('');
  const [rejectNote, setRejectNote] = React.useState<string>('');

  const requests = React.useMemo(() => {
    return enquiries.filter(e => e.samplingRequest).map(e => ({
      enquiry: e,
      req: e.samplingRequest!
    }));
  }, [enquiries]);

  const metrics = React.useMemo(() => {
    const list = requests.map(r => r.req);
    const total = list.length;
    const requested = list.filter(r => r.status === 'Requested').length;
    const inProgress = list.filter(r => r.status === 'In Progress').length;
    const readyReview = list.filter(r => r.status === 'Ready for Review').length;
    const approved = list.filter(r => r.status === 'Approved').length;

    const workloads: Record<string, number> = {};
    list.forEach(r => {
      const name = r.assignee || 'Unassigned';
      workloads[name] = (workloads[name] || 0) + 1;
    });

    return { total, requested, inProgress, readyReview, approved, workloads };
  }, [requests]);

  const activeDetail = React.useMemo(() => {
    if (!selectedEnquiryId) return null;
    return requests.find(r => r.enquiry.id === selectedEnquiryId) || null;
  }, [requests, selectedEnquiryId]);

  return (
    <div className="space-y-4 text-[10px]">
      {/* Header */}
      <div className="border-b pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase">Sampling Quality Assurance Dashboard</h1>
          <p className="text-neutral-500 text-[10px]">Strategic operations oversight, lab load dispatching, and sample sign-off controls.</p>
        </div>
        <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase">Management Terminal</span>
      </div>

      {/* Stats scorecards */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total requests</span>
          <span className="text-sm font-black text-neutral-900">{metrics.total}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Requested</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.requested}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">In Progress</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.inProgress}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Ready for Review</span>
          <span className="text-sm font-bold text-blue-600">{metrics.readyReview}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Approved</span>
          <span className="text-sm font-bold text-emerald-600">{metrics.approved}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Requests list */}
        <div className="bg-white border p-3 space-y-2 text-[10px]">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Sampling Pipeline Work</span>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {requests.map(({ enquiry, req }) => {
              const isSelected = enquiry.id === selectedEnquiryId;
              return (
                <div
                  key={enquiry.id}
                  onClick={() => setSelectedEnquiryId(enquiry.id)}
                  className={`p-2 border cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-950 text-white border-neutral-950' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong className="font-mono">{enquiry.id}</strong>
                    <span className="text-[8px] uppercase font-bold">{req.status}</span>
                  </div>
                  <p className="truncate font-medium">{enquiry.customerName}</p>
                  <p className="text-[9px] opacity-85 truncate">Product: {enquiry.product}</p>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-neutral-300 opacity-90 text-[8px]">
                    <span>Technician: {req.assignee || 'Unassigned'}</span>
                    <span>Due: {req.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action desk */}
        <div className="lg:col-span-2 bg-white border p-4 space-y-4">
          {!activeDetail ? (
            <div className="text-center py-12 text-neutral-500 italic">
              Please select a sampling record from the left list to initiate management assignment or final approval.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-neutral-950 uppercase">Manager Sampling Desk &bull; {activeDetail.enquiry.id}</h3>
                  <p className="text-neutral-500">
                    Product: <strong className="text-neutral-800">{activeDetail.enquiry.product}</strong>
                  </p>
                </div>
                <span className="px-2 py-0.5 font-mono text-[8px] font-bold border uppercase bg-amber-50 text-amber-700">
                  {activeDetail.req.status}
                </span>
              </div>

              {/* Assignment controls */}
              <div className="border p-3 space-y-2 bg-neutral-50">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Assign / Reassign Task</span>
                <div className="flex gap-2">
                  <select
                    id="samplingAssigneeSelect"
                    defaultValue={activeDetail.req.assignee || ''}
                    className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                  >
                    <option value="">Unassigned</option>
                    <option value="Liam Carter">Liam Carter [Sampling Tech]</option>
                    <option value="Oliver Vance">Oliver Vance [Sampling Department Head]</option>
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById('samplingAssigneeSelect') as HTMLSelectElement;
                      if (handleAssignSamplingRequest && sel) {
                        handleAssignSamplingRequest(activeDetail.enquiry.id, sel.value);
                      } else {
                        safeToast('Assignment handler not active.');
                      }
                    }}
                    className="bg-neutral-900 text-white font-bold uppercase text-[8px] px-3 py-1"
                  >
                    Commit Assignment
                  </button>
                </div>
              </div>

              {/* Work details review */}
              <div className="border p-3 space-y-2 bg-white">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block border-b pb-1">Review Packaging & Testing specifications</span>
                <div className="grid grid-cols-2 gap-2 leading-relaxed">
                  <div><strong>Sample Type:</strong> {activeDetail.req.sampleType || 'Not entered'}</div>
                  <div><strong>Moisture %:</strong> {activeDetail.req.moisturePercentage || '0'}%</div>
                  <div><strong>Purity %:</strong> {activeDetail.req.purityPercentage || '0'}%</div>
                  <div><strong>Weight (g):</strong> {activeDetail.req.weightGrams || '0'}g</div>
                  <div><strong>Quantity:</strong> {activeDetail.req.quantity || '0'}</div>
                  <div><strong>Sealing:</strong> {activeDetail.req.condition || 'Not set'}</div>
                  <div><strong>Lab Results:</strong> {activeDetail.req.labResults || 'Not set'}</div>
                  <div><strong>Tracking waybill:</strong> {activeDetail.req.trackingNumber || 'Not set'}</div>
                </div>
              </div>

              {/* Sign off */}
              {activeDetail.req.status !== 'Approved' && (
                <div className="border border-neutral-950 p-3 space-y-2 bg-neutral-50">
                  <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Manager Review Decision Center</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (handleApproveSamplingRequest) {
                          handleApproveSamplingRequest(activeDetail.enquiry.id);
                        } else {
                          safeToast('Approval handler not linked.');
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase px-3 py-1.5"
                    >
                      ✓ Sign & Approve Sample Release
                    </button>

                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        placeholder="Feedback note for revision..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => {
                          if (!rejectNote.trim()) {
                            safeToast('Please specify reason for revision.');
                            return;
                          }
                          if (handleRejectSamplingRequest) {
                            handleRejectSamplingRequest(activeDetail.enquiry.id, rejectNote);
                            setRejectNote('');
                          }
                        }}
                        className="bg-red-600 text-white font-bold uppercase px-3 py-1"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DashLogisticsViewProps {
  enquiries?: Enquiry[];
  currentUser?: User;
  triggerToast?: (msg: string) => void;
  handleAssignLogisticsRequest?: (enquiryId: string, assigneeName: string) => void;
  handleApproveLogisticsRequest?: (enquiryId: string) => void;
  handleRejectLogisticsRequest?: (enquiryId: string, note: string) => void;
}

// ==========================================
// 4. DASHBOARD LOGISTICS VIEW
// ==========================================
export function DashLogisticsView({
  enquiries = [],
  currentUser,
  triggerToast,
  handleAssignLogisticsRequest,
  handleApproveLogisticsRequest,
  handleRejectLogisticsRequest,
}: DashLogisticsViewProps) {
  const safeToast = triggerToast || ((m: string) => console.log(m));
  const [selectedEnquiryId, setSelectedEnquiryId] = React.useState<string>('');
  const [rejectNote, setRejectNote] = React.useState<string>('');

  const requests = React.useMemo(() => {
    return enquiries.filter(e => e.logisticsRequest).map(e => ({
      enquiry: e,
      req: e.logisticsRequest!
    }));
  }, [enquiries]);

  const metrics = React.useMemo(() => {
    const list = requests.map(r => r.req);
    const total = list.length;
    const requested = list.filter(r => r.status === 'Requested').length;
    const inProgress = list.filter(r => r.status === 'In Progress').length;
    const readyReview = list.filter(r => r.status === 'Ready for Review').length;
    const approved = list.filter(r => r.status === 'Approved').length;

    return { total, requested, inProgress, readyReview, approved };
  }, [requests]);

  const activeDetail = React.useMemo(() => {
    if (!selectedEnquiryId) return null;
    return requests.find(r => r.enquiry.id === selectedEnquiryId) || null;
  }, [requests, selectedEnquiryId]);

  return (
    <div className="space-y-4 text-[10px]">
      {/* Header */}
      <div className="border-b pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase">Logistics & Ocean Freight Dashboard</h1>
          <p className="text-neutral-500 text-[10px]">Strategic operations oversight, freight slot booking and shipping confirmations.</p>
        </div>
        <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase">Management Terminal</span>
      </div>

      {/* Stats scorecard */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total requests</span>
          <span className="text-sm font-black text-neutral-900">{metrics.total}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Requested</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.requested}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">In Progress</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.inProgress}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Ready for Review</span>
          <span className="text-sm font-bold text-blue-600">{metrics.readyReview}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Approved</span>
          <span className="text-sm font-bold text-emerald-600">{metrics.approved}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Requests list */}
        <div className="bg-white border p-3 space-y-2 text-[10px]">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Logistics Pipeline Bookings</span>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {requests.map(({ enquiry, req }) => {
              const isSelected = enquiry.id === selectedEnquiryId;
              return (
                <div
                  key={enquiry.id}
                  onClick={() => setSelectedEnquiryId(enquiry.id)}
                  className={`p-2 border cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-950 text-white border-neutral-950' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong className="font-mono">{enquiry.id}</strong>
                    <span className="text-[8px] uppercase font-bold">{req.status}</span>
                  </div>
                  <p className="truncate font-medium">{enquiry.customerName}</p>
                  <p className="text-[9px] opacity-85 truncate">Port: {enquiry.destinationPort}</p>
                  <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-dashed border-neutral-300 opacity-90 text-[8px]">
                    <span>Operator: {req.assignee || 'Unassigned'}</span>
                    <span>Due: {req.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action desk */}
        <div className="lg:col-span-2 bg-white border p-4 space-y-4">
          {!activeDetail ? (
            <div className="text-center py-12 text-neutral-500 italic">
              Please select a logistics booking from the left list to initiate management assignment or final approval.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-neutral-950 uppercase">Manager Logistics Desk &bull; {activeDetail.enquiry.id}</h3>
                  <p className="text-neutral-500">
                    Product: <strong className="text-neutral-800">{activeDetail.enquiry.product}</strong>
                  </p>
                </div>
                <span className="px-2 py-0.5 font-mono text-[8px] font-bold border uppercase bg-amber-50 text-amber-700">
                  {activeDetail.req.status}
                </span>
              </div>

              {/* Assignment controls */}
              <div className="border p-3 space-y-2 bg-neutral-50">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Assign / Reassign Task</span>
                <div className="flex gap-2">
                  <select
                    id="logisticsAssigneeSelect"
                    defaultValue={activeDetail.req.assignee || ''}
                    className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                  >
                    <option value="">Unassigned</option>
                    <option value="Chloe Taylor">Chloe Taylor [Freight Operator]</option>
                    <option value="Kenji Sato">Kenji Sato [Logistics Department Head]</option>
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById('logisticsAssigneeSelect') as HTMLSelectElement;
                      if (handleAssignLogisticsRequest && sel) {
                        handleAssignLogisticsRequest(activeDetail.enquiry.id, sel.value);
                      } else {
                        safeToast('Assignment handler not active.');
                      }
                    }}
                    className="bg-neutral-900 text-white font-bold uppercase text-[8px] px-3 py-1"
                  >
                    Commit Assignment
                  </button>
                </div>
              </div>

              {/* Work details review */}
              <div className="border p-3 space-y-2 bg-white">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block border-b pb-1">Review shipping & container parameters</span>
                <div className="grid grid-cols-2 gap-2 leading-relaxed">
                  <div><strong>Container Option:</strong> {activeDetail.req.containerType || 'Not set'}</div>
                  <div><strong>Vessel Name:</strong> {activeDetail.req.vessel || 'Not set'} {activeDetail.req.voyage}</div>
                  <div><strong>Carrier:</strong> {activeDetail.req.carrier || 'Not set'}</div>
                  <div><strong>Booking Ref:</strong> {activeDetail.req.bookingRef || 'Not set'}</div>
                  <div><strong>Ocean Freight charges:</strong> ${activeDetail.req.freightCharges || '0'}</div>
                  <div><strong>Terminal THC charges:</strong> ${activeDetail.req.terminalCharges || '0'}</div>
                  <div><strong>Loading date SLA:</strong> {activeDetail.req.loadingDate || 'Not set'}</div>
                  <div><strong>Terminal Port details:</strong> {activeDetail.req.portInfo || 'Not set'}</div>
                </div>
              </div>

              {/* Sign off */}
              {activeDetail.req.status !== 'Approved' && (
                <div className="border border-neutral-950 p-3 space-y-2 bg-neutral-50">
                  <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Manager Review Decision Center</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (handleApproveLogisticsRequest) {
                          handleApproveLogisticsRequest(activeDetail.enquiry.id);
                        } else {
                          safeToast('Approval handler not linked.');
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase px-3 py-1.5"
                    >
                      ✓ Sign & Release Logistics Booking
                    </button>

                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        placeholder="Feedback note for revision..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => {
                          if (!rejectNote.trim()) {
                            safeToast('Please specify reason for revision.');
                            return;
                          }
                          if (handleRejectLogisticsRequest) {
                            handleRejectLogisticsRequest(activeDetail.enquiry.id, rejectNote);
                            setRejectNote('');
                          }
                        }}
                        className="bg-red-600 text-white font-bold uppercase px-3 py-1"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DashComplianceViewProps {
  enquiries?: Enquiry[];
  currentUser?: User;
  triggerToast?: (msg: string) => void;
  handleAssignComplianceRequest?: (enquiryId: string, assigneeName: string) => void;
  handleApproveComplianceRequest?: (enquiryId: string) => void;
  handleRejectComplianceRequest?: (enquiryId: string, note: string) => void;
}

// ==========================================
// 5. DASHBOARD COMPLIANCE VIEW
// ==========================================
export function DashComplianceView({
  enquiries = [],
  currentUser,
  triggerToast,
  handleAssignComplianceRequest,
  handleApproveComplianceRequest,
  handleRejectComplianceRequest,
}: DashComplianceViewProps) {
  const safeToast = triggerToast || ((m: string) => console.log(m));
  const [selectedEnquiryId, setSelectedEnquiryId] = React.useState<string>('');
  const [rejectNote, setRejectNote] = React.useState<string>('');

  const requests = React.useMemo(() => {
    return enquiries.filter(e => e.complianceRequest).map(e => ({
      enquiry: e,
      req: e.complianceRequest!
    }));
  }, [enquiries]);

  const metrics = React.useMemo(() => {
    const list = requests.map(r => r.req);
    const total = list.length;
    const requested = list.filter(r => r.status === 'Requested').length;
    const inProgress = list.filter(r => r.status === 'In Progress').length;
    const readyReview = list.filter(r => r.status === 'Ready for Review').length;
    const approved = list.filter(r => r.status === 'Approved').length;

    return { total, requested, inProgress, readyReview, approved };
  }, [requests]);

  const activeDetail = React.useMemo(() => {
    if (!selectedEnquiryId) return null;
    return requests.find(r => r.enquiry.id === selectedEnquiryId) || null;
  }, [requests, selectedEnquiryId]);

  return (
    <div className="space-y-4 text-[10px]">
      {/* Header */}
      <div className="border-b pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase">Compliance Verification Log Dashboard</h1>
          <p className="text-neutral-500 text-[10px]">Strategic operations oversight, quarantine clearance stamps, and sanitary certification.</p>
        </div>
        <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase">Management Terminal</span>
      </div>

      {/* Stats scorecard */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total cases</span>
          <span className="text-sm font-black text-neutral-900">{metrics.total}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Requested</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.requested}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">In Progress</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.inProgress}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Ready for Review</span>
          <span className="text-sm font-bold text-blue-600">{metrics.readyReview}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Sealed Pass</span>
          <span className="text-sm font-bold text-emerald-600">{metrics.approved}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Requests list */}
        <div className="bg-white border p-3 space-y-2 text-[10px]">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Compliance Cases Queue</span>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {requests.map(({ enquiry, req }) => {
              const isSelected = enquiry.id === selectedEnquiryId;
              return (
                <div
                  key={enquiry.id}
                  onClick={() => setSelectedEnquiryId(enquiry.id)}
                  className={`p-2 border cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-950 text-white border-neutral-950' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong className="font-mono">{enquiry.id}</strong>
                    <span className="text-[8px] uppercase font-bold">{req.status}</span>
                  </div>
                  <p className="truncate font-medium">{enquiry.customerName}</p>
                  <p className="text-[9px] opacity-85 truncate">Coop: {enquiry.vendorApproval.vendorName}</p>
                  <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-dashed border-neutral-300 opacity-90 text-[8px]">
                    <span>Clerk: {req.assignee || 'Unassigned'}</span>
                    <span>Due: {req.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action desk */}
        <div className="lg:col-span-2 bg-white border p-4 space-y-4">
          {!activeDetail ? (
            <div className="text-center py-12 text-neutral-500 italic">
              Please select a compliance case from the left list to initiate management assignment or final certification stamp.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-neutral-950 uppercase">Manager Compliance Desk &bull; {activeDetail.enquiry.id}</h3>
                  <p className="text-neutral-500">
                    Sourcing product: <strong className="text-neutral-800">{activeDetail.enquiry.product}</strong>
                  </p>
                </div>
                <span className="px-2 py-0.5 font-mono text-[8px] font-bold border uppercase bg-amber-50 text-amber-700">
                  {activeDetail.req.status}
                </span>
              </div>

              {/* Assignment controls */}
              <div className="border p-3 space-y-2 bg-neutral-50">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Assign / Reassign Task</span>
                <div className="flex gap-2">
                  <select
                    id="complianceAssigneeSelect"
                    defaultValue={activeDetail.req.assignee || ''}
                    className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                  >
                    <option value="">Unassigned</option>
                    <option value="Sophia Miller">Sophia Miller [Compliance Clerk]</option>
                    <option value="Elena Rostova">Elena Rostova [Compliance Department Head]</option>
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById('complianceAssigneeSelect') as HTMLSelectElement;
                      if (handleAssignComplianceRequest && sel) {
                        handleAssignComplianceRequest(activeDetail.enquiry.id, sel.value);
                      } else {
                        safeToast('Assignment handler not active.');
                      }
                    }}
                    className="bg-neutral-900 text-white font-bold uppercase text-[8px] px-3 py-1"
                  >
                    Commit Assignment
                  </button>
                </div>
              </div>

              {/* Work details review */}
              <div className="border p-3 space-y-2 bg-white">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block border-b pb-1">Review Quarantine and Checklist clearances</span>
                <div className="grid grid-cols-2 gap-2 leading-relaxed">
                  <div><strong>Quarantine Status:</strong> {activeDetail.req.quarantineStatus || 'Not set'}</div>
                  <div><strong>Vendor Licence Status:</strong> {activeDetail.req.vendorDocsStatus || 'Not set'}</div>
                  <div><strong>Farm Sanitation Pass:</strong> {activeDetail.req.farmSanitationPassed ? 'YES ✓' : 'NO'}</div>
                  <div><strong>Audit findings:</strong> {activeDetail.req.findings || 'No findings recorded.'}</div>
                  <div className="col-span-2">
                    <strong>Checklist Verification:</strong>
                    <ul className="list-disc pl-4 text-[9px] mt-1">
                      <li>Cooperative Licences Verified: {activeDetail.req.checklist?.docsVerified ? 'YES ✓' : 'NO'}</li>
                      <li>Lab Quarantine Seal Approved: {activeDetail.req.checklist?.quarantineApproved ? 'YES ✓' : 'NO'}</li>
                      <li>Plant Sanitation Certified: {activeDetail.req.checklist?.sanitationPassed ? 'YES ✓' : 'NO'}</li>
                      <li>Phytosanitary Export Stamp Sealed: {activeDetail.req.checklist?.certificatesStamped ? 'YES ✓' : 'NO'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sign off */}
              {activeDetail.req.status !== 'Approved' && (
                <div className="border border-neutral-950 p-3 space-y-2 bg-neutral-50">
                  <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Manager Review Decision Center</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (handleApproveComplianceRequest) {
                          handleApproveComplianceRequest(activeDetail.enquiry.id);
                        } else {
                          safeToast('Approval handler not linked.');
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase px-3 py-1.5"
                    >
                      ✓ Stamp & Approve Export Certificate Release
                    </button>

                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        placeholder="Feedback note for revision..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => {
                          if (!rejectNote.trim()) {
                            safeToast('Please specify reason for revision.');
                            return;
                          }
                          if (handleRejectComplianceRequest) {
                            handleRejectComplianceRequest(activeDetail.enquiry.id, rejectNote);
                            setRejectNote('');
                          }
                        }}
                        className="bg-red-600 text-white font-bold uppercase px-3 py-1"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 6. DASHBOARD HR VIEW
// ==========================================
import { HREmployee, Task } from '../../types/crm';

interface DashHRViewProps {
  hrEmployees: HREmployee[];
  tasks: Task[];
  triggerToast: (msg: string) => void;
  handleActionHRAttendanceRequest: (employeeId: string, requestId: string, status: 'Approved' | 'Rejected') => void;
}

export function DashHRView({
  hrEmployees = [],
  tasks = [],
  triggerToast,
  handleActionHRAttendanceRequest,
}: DashHRViewProps) {
  const safeToast = triggerToast || ((m: string) => console.log(m));

  const metrics = React.useMemo(() => {
    const total = hrEmployees.length;
    const active = hrEmployees.filter(e => e.status === 'Active').length;
    const onboarding = hrEmployees.filter(e => e.status === 'Onboarding').length;
    const offboarding = hrEmployees.filter(e => e.status === 'Offboarding').length;

    // pending leave requests
    let pendingLeaves = 0;
    hrEmployees.forEach(e => {
      pendingLeaves += e.attendanceRequests.filter(r => r.status === 'Pending').length;
    });

    // pending HR tasks
    const pendingHRTasks = tasks.filter(t => t.department === 'HR' && t.status !== 'Completed').length;

    return { total, active, onboarding, offboarding, pendingLeaves, pendingHRTasks };
  }, [hrEmployees, tasks]);

  return (
    <div className="space-y-4 text-[10px]">
      {/* Header */}
      <div className="border-b pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase">HR Department Head Dashboard</h1>
          <p className="text-neutral-500 text-[10px]">Personnel rosters, onboarding completions, and leave/attendance authorizations.</p>
        </div>
        <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase">Management Terminal</span>
      </div>

      {/* Stats scorecard */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total Staff</span>
          <span className="text-sm font-black text-neutral-900">{metrics.total}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active</span>
          <span className="text-sm font-bold text-emerald-600">{metrics.active}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Onboarding</span>
          <span className="text-sm font-bold text-blue-600">{metrics.onboarding}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Offboarding</span>
          <span className="text-sm font-bold text-red-600">{metrics.offboarding}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Leave Requests</span>
          <span className="text-sm font-bold text-amber-600">{metrics.pendingLeaves}</span>
        </div>
        <div className="bg-white border p-2 text-center">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Open HR Tasks</span>
          <span className="text-sm font-bold text-neutral-900">{metrics.pendingHRTasks}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Leave Requests Approvals Panel */}
        <div className="bg-white border p-3 space-y-2">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Pending Leave & Sick Requests</span>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {hrEmployees.flatMap(emp =>
              emp.attendanceRequests.filter(r => r.status === 'Pending').map(req => (
                <div key={req.id} className="p-2 border bg-neutral-50 flex justify-between items-center">
                  <div>
                    <strong className="text-neutral-950 block">{emp.name}</strong>
                    <span className="text-[9px] text-neutral-500">{req.type} &bull; Dates: {req.startDate} to {req.endDate}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleActionHRAttendanceRequest(emp.id, req.id, 'Approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[8px] px-2.5 py-1"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleActionHRAttendanceRequest(emp.id, req.id, 'Rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[8px] px-2.5 py-1"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
            {hrEmployees.every(emp => emp.attendanceRequests.filter(r => r.status === 'Pending').length === 0) && (
              <p className="text-neutral-400 italic text-center py-6">All staff attendance requests have been processed.</p>
            )}
          </div>
        </div>

        {/* Onboarding Pipelines overview */}
        <div className="bg-white border p-3 space-y-2">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">New Employee Onboarding Progress</span>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {hrEmployees.filter(e => e.status === 'Onboarding').map(emp => {
              const total = emp.onboardingChecklist.length;
              const completed = emp.onboardingChecklist.filter(c => c.completed).length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={emp.id} className="p-2 border bg-neutral-50 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{emp.name} ({emp.id})</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2">
                    <div className="bg-blue-600 h-2" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="text-[8px] text-neutral-400 truncate">
                    Pending: {emp.onboardingChecklist.filter(c => !c.completed).map(c => c.task).join(', ')}
                  </div>
                </div>
              );
            })}
            {hrEmployees.filter(e => e.status === 'Onboarding').length === 0 && (
              <p className="text-neutral-400 italic text-center py-6">No employees currently in the onboarding sequence.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
