import React, { useState, useMemo, useEffect } from 'react';
import { Enquiry, User, Task, SamplingRequest } from '../../types/crm';
import { ModuleDeskView, CustomView } from '../ModuleDeskView';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface OpsSamplingViewProps {
  enquiries: Enquiry[];
  currentUser: User;
  triggerToast: (msg: string) => void;
  handleAssignSamplingRequest: (enquiryId: string, assigneeName: string) => void;
  handleUpdateSamplingDetails: (enquiryId: string, details: Partial<Omit<SamplingRequest, 'id' | 'enquiryId' | 'comments' | 'documents' | 'internalRequests'>>) => void;
  handleSubmitSamplingRequest: (enquiryId: string) => void;
  handleAddSamplingComment: (enquiryId: string, text: string) => void;
  handleAddSamplingDocument: (enquiryId: string, fileName: string) => void;
  handleRequestSamplingInternalTask: (
    enquiryId: string,
    title: string,
    department: string,
    assignee: string,
    description: string,
    priority: string,
    dueDate: string
  ) => void;
  setActiveTaskId: (id: string | null) => void;
}

interface FlatSamplingItem {
  id: string;
  customerName: string;
  product: string;
  quantity: string;
  status: string;
  priority: string;
  assignee: string;
  carrier: string;
  trackingNumber: string;
  originalEnquiry: Enquiry;
}

export function OpsSamplingView({
  enquiries,
  currentUser,
  triggerToast,
  handleAssignSamplingRequest,
  handleUpdateSamplingDetails,
  handleSubmitSamplingRequest,
  handleAddSamplingComment,
  handleAddSamplingDocument,
  handleRequestSamplingInternalTask,
  setActiveTaskId,
}: OpsSamplingViewProps) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');
  const [activeSubTab, setActiveTab] = useState<'Overview' | 'Specs' | 'Lab & Courier' | 'Total'>('Overview');

  // Specs form inputs
  const [sampleType, setSampleType] = useState('');
  const [moisture, setMoisture] = useState('');
  const [purity, setPurity] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('');

  // Courier/Lab form inputs
  const [labResults, setLabResults] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Tasks dispatch inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDept, setTaskDept] = useState('Compliance');
  const [taskAssignee, setTaskAssignee] = useState('Sophia Miller');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-28');

  // Comments/Doc inputs
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');

  const isManager = currentUser.department === 'Sampling' && currentUser.isManager;
  const isPresidentOrAdmin = currentUser.isPresident || currentUser.isAdmin;

  const samplingEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      if (!e.samplingRequest) return false;
      if (!isManager && !isPresidentOrAdmin) {
        return e.samplingRequest.assignee === currentUser.name || e.samplingRequest.assignee === '';
      }
      return true;
    });
  }, [enquiries, currentUser, isManager, isPresidentOrAdmin]);

  const stats = useMemo(() => {
    const list = enquiries.map(e => e.samplingRequest).filter((r): r is Exclude<typeof r, undefined> => !!r);
    return [
      {
        label: 'Incoming Requests',
        value: list.filter(r => r.status === 'Requested').length,
        subtext: 'Pending packing/assignment'
      },
      {
        label: 'My Quality Cases',
        value: list.filter(r => r.assignee === currentUser.name).length,
        subtext: 'Your current lab stack'
      },
      {
        label: 'Pending Total',
        value: list.filter(r => r.status !== 'Approved').length,
        subtext: 'Active pipeline'
      },
      {
        label: 'Approved Samples',
        value: list.filter(r => r.status === 'Approved').length,
        subtext: 'Waybills officially sealed',
        subtextColorClass: 'text-emerald-600 font-bold'
      }
    ];
  }, [enquiries, currentUser]);

  const mappedData = useMemo<FlatSamplingItem[]>(() => {
    return samplingEnquiries.map(e => ({
      id: e.id,
      customerName: e.customerName,
      product: e.product,
      quantity: e.quantity,
      status: e.samplingRequest?.status || 'Requested',
      priority: e.samplingRequest?.priority || 'Medium',
      assignee: e.samplingRequest?.assignee || 'Unassigned',
      carrier: e.samplingRequest?.carrier || 'None',
      trackingNumber: e.samplingRequest?.trackingNumber || 'Pending',
      originalEnquiry: e,
    }));
  }, [samplingEnquiries]);

  // Table Columns Setup
  const columns = useMemo<ColumnDef<FlatSamplingItem>[]>(() => [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'Enquiry ID',
      cell: info => <span className="font-mono font-bold text-neutral-900">{info.getValue() as string}</span>,
    },
    {
      id: 'customerName',
      accessorKey: 'customerName',
      header: 'Customer',
      cell: info => <span className="font-bold text-neutral-950">{info.getValue() as string}</span>,
    },
    {
      id: 'product',
      accessorKey: 'product',
      header: 'QC Crop Spec',
      cell: info => <span className="font-semibold text-neutral-800">{info.getValue() as string}</span>,
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: 'Priority',
      cell: info => {
        const val = info.getValue() as string;
        const color = val === 'High' ? 'text-red-600 bg-red-50 border-red-200' : 'text-neutral-600 bg-neutral-50';
        return <span className={`inline-block px-1 py-0.2 text-[8px] font-bold border uppercase ${color}`}>{val}</span>;
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const val = info.getValue() as string;
        let color = 'bg-neutral-100 text-neutral-700 border-neutral-200';
        if (val === 'Approved') {
          color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        } else if (val === 'Ready for Review' || val === 'Submitted') {
          color = 'bg-blue-50 text-blue-800 border-blue-200';
        } else if (val === 'In Progress') {
          color = 'bg-amber-50 text-amber-800 border-amber-200';
        }
        return <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold border uppercase ${color}`}>{val}</span>;
      }
    },
    {
      id: 'carrierInfo',
      header: 'Courier Reference',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-medium">{row.carrier}</span>
            <span className="block text-[8px] font-mono text-neutral-400">Waybill: {row.trackingNumber}</span>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEnquiryId(row.id);
                setActiveTab('Overview');
              }}
              className="bg-black hover:bg-neutral-800 text-white text-[9px] px-2.5 py-0.5 rounded-none uppercase font-bold"
            >
              Open Workspace →
            </button>
          </div>
        );
      }
    }
  ], []);

  // Kanban view card renderer
  const renderKanbanCard = (item: FlatSamplingItem, onSelect: () => void) => {
    return (
      <div
        onClick={onSelect}
        className="bg-white border border-neutral-200 p-2.5 cursor-grab active:cursor-grabbing hover:border-black transition-all space-y-1.5 shadow-2xs relative"
      >
        <div className="flex justify-between items-start">
          <span className="font-mono font-bold text-neutral-400 text-[8px]">{item.id}</span>
          <span className={`inline-block px-1 py-0.2 text-[7px] font-bold border uppercase ${
            item.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-neutral-50 text-neutral-600 border-neutral-100'
          }`}>{item.priority}</span>
        </div>

        <div>
          <strong className="block text-neutral-900 text-[11px] leading-tight font-black">{item.customerName}</strong>
          <span className="text-neutral-500 text-[9px] block">Crop: {item.product}</span>
        </div>

        <div className="text-[9px] border-t border-neutral-100 pt-1.5 space-y-0.5">
          <span className="block text-neutral-700">📦 Carrier: <span className="font-bold">{item.carrier}</span></span>
          <span className="block text-neutral-400 font-mono text-[8px]">Waybill: {item.trackingNumber}</span>
        </div>

        <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100 items-center justify-between">
          <span className="text-neutral-500 text-[8px]">Tech: {item.assignee}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="bg-neutral-950 text-white text-[7px] font-bold px-1.5 py-0.5 uppercase flex items-center space-x-0.5"
          >
            <span>Open</span>
            <ArrowRight className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>
    );
  };

  const activeEnquiry = enquiries.find(e => e.id === selectedEnquiryId) || null;
  const req = activeEnquiry?.samplingRequest;

  // Sync inputs on selection
  useEffect(() => {
    if (req) {
      setSampleType(req.sampleType || '');
      setMoisture(req.moisturePercentage ? req.moisturePercentage.toString() : '');
      setPurity(req.purityPercentage ? req.purityPercentage.toString() : '');
      setWeight(req.weightGrams ? req.weightGrams.toString() : '');
      setQuantity(req.quantity ? req.quantity.toString() : '');
      setCondition(req.condition || '');
      setLabResults(req.labResults || '');
      setCarrier(req.carrier || '');
      setTrackingNumber(req.trackingNumber || '');
    }
  }, [req]);

  const handleSaveSpecs = () => {
    if (!activeEnquiry) return;
    handleUpdateSamplingDetails(activeEnquiry.id, {
      sampleType,
      moisturePercentage: parseFloat(moisture) || 0,
      purityPercentage: parseFloat(purity) || 0,
      weightGrams: parseFloat(weight) || 0,
      quantity: parseInt(quantity) || 0,
      condition,
    });
  };

  const handleSaveCourier = () => {
    if (!activeEnquiry) return;
    handleUpdateSamplingDetails(activeEnquiry.id, {
      labResults,
      carrier,
      trackingNumber,
    });
  };

  // Custom views setup
  const fieldsForCustomView: { value: keyof FlatSamplingItem; label: string }[] = [
    { value: 'customerName', label: 'Client Firm' },
    { value: 'product', label: 'Product' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'carrier', label: 'Carrier Courier' }
  ];

  const defaultCustomViews: CustomView<FlatSamplingItem>[] = [
    {
      id: 'view-high-priority-qc',
      name: 'High Priority',
      conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
      isBuiltIn: true
    },
    {
      id: 'view-assigned-to-me-qc',
      name: 'My Lab Work',
      conditions: [{ field: 'assignee', operator: 'equals', value: currentUser.name }],
      isBuiltIn: true
    }
  ];

  // Render list (Desk View)
  if (!selectedEnquiryId) {
    return (
      <ModuleDeskView<FlatSamplingItem>
        title="Sampling Desk Tracking Queue"
        subtitle="Independent laboratory quality control desk monitoring moisture, agronomic purity, and air courier waybill releases."
        data={mappedData}
        columns={columns}
        kanbanColumns={['Requested', 'In Progress', 'Awaiting Inputs', 'Ready for Review', 'Submitted', 'Approved']}
        getKanbanColumnValue={item => item.status}
        onUpdateStatus={async (id, newStatus) => {
          const original = enquiries.find(e => e.id === id);
          if (original && original.samplingRequest) {
            original.samplingRequest.status = newStatus as any;
            triggerToast(`Sampling status updated to ${newStatus}`);
          }
        }}
        renderKanbanCard={renderKanbanCard}
        localStorageKey="aftermeet_sampling_custom_views"
        defaultCustomViews={defaultCustomViews}
        fieldsForCustomView={fieldsForCustomView}
        stats={stats}
        onItemSelect={(item) => {
          setSelectedEnquiryId(item.id);
          setActiveTab('Overview');
        }}
        globalSearchFields={['id', 'customerName', 'product', 'status', 'priority', 'assignee', 'carrier', 'trackingNumber']}
      />
    );
  }

  // Render detailed workspace (Detail View)
  if (!activeEnquiry || !req) return null;

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setSelectedEnquiryId('')}
          className="flex items-center space-x-1 text-neutral-600 hover:text-black font-bold uppercase text-[10px]"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Sampling Desk</span>
        </button>
      </div>

      {/* Active Header Block */}
      <div className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 rounded-none">
        <div>
          <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase">Quality Control Hub</span>
          <h2 className="text-xs font-bold text-neutral-950 mt-1">
            {activeEnquiry.id} &mdash; {activeEnquiry.customerName}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 text-[9px]">
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Stage: <strong>{req.status}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Courier: <strong>{req.carrier || 'Pending'}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Tech: <strong>{req.assignee || 'Unassigned'}</strong>
          </span>
        </div>
      </div>

      {/* Claim Button */}
      {!req.assignee && (
        <div className="bg-amber-50 border border-amber-200 p-3 flex justify-between items-center text-[10px]">
          <span className="text-amber-800 font-medium">This QA request is currently unassigned. Claim it to start lab specifications recording.</span>
          <button
            onClick={() => handleAssignSamplingRequest(activeEnquiry.id, currentUser.name)}
            className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold uppercase px-3 py-1 text-[9px]"
            type="button"
          >
            Claim Quality Case
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5 overflow-x-auto">
        {(['Overview', 'Specs', 'Lab & Courier', 'Total'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase shrink-0 transition-colors ${
              activeSubTab === tab ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Viewport */}
      <div className="p-4 border bg-white min-h-[350px] text-[10px] space-y-4">

        {/* OVERVIEW */}
        {activeSubTab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 border p-3">
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Target moisture SLA</span>
                <span className="font-bold text-neutral-900">Under 6.5%</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Sourcing Cooperative Farm</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.vendorApproval.vendorName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document attachment */}
              <div className="bg-neutral-50 border p-3 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Lab Testing Certificates ({req.documents.length})</span>
                {req.documents.length === 0 ? (
                  <p className="text-neutral-400 italic text-[9px]">No certificates uploaded yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {req.documents.map(doc => (
                      <div key={doc.id} className="text-[9px] p-1 border flex justify-between items-center bg-white">
                        <span className="font-medium text-neutral-900 truncate w-32">{doc.fileName}</span>
                        <span className="text-neutral-400 text-[8px]">{doc.uploadedBy}</span>
                      </div>
                    ))}
                  </div>
                )}
                {req.status !== 'Approved' && (
                  <div className="flex gap-1 pt-1.5 border-t">
                    <input
                      type="text"
                      placeholder="e.g. Phytosanitary_Report.pdf"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      className="bg-white border px-2 py-1 text-[9px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!docName.trim()) return;
                        handleAddSamplingDocument(activeEnquiry.id, docName);
                        setDocName('');
                      }}
                      className="bg-neutral-950 text-white text-[8px] px-2 py-1 uppercase font-bold"
                      type="button"
                    >
                      Attach
                    </button>
                  </div>
                )}
              </div>

              {/* Lab comments thread */}
              <div className="bg-neutral-50 border p-3 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Discussion & Log Remarks ({req.comments.length})</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {req.comments.map(c => (
                    <div key={c.id} className="bg-white p-2 border text-[9px]">
                      <p className="text-neutral-800">{c.text}</p>
                      <span className="text-[8px] text-neutral-400 block mt-0.5">By: {c.author} &bull; {c.date}</span>
                    </div>
                  ))}
                </div>
                {req.status !== 'Approved' && (
                  <div className="flex gap-1 pt-1.5 border-t">
                    <input
                      type="text"
                      placeholder="Add lab notes..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="bg-white border px-2 py-1 text-[9px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!commentText.trim()) return;
                        handleAddSamplingComment(activeEnquiry.id, commentText);
                        setCommentText('');
                      }}
                      className="bg-neutral-950 text-white text-[8px] px-2 py-1 uppercase font-bold"
                      type="button"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SPECS */}
        {activeSubTab === 'Specs' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Sample Physical Characteristics</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Sample Type</label>
                <input
                  type="text"
                  value={sampleType}
                  onChange={e => setSampleType(e.target.value)}
                  placeholder="e.g. Organic Grade A splits"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Moisture Content (%)</label>
                <input
                  type="number"
                  value={moisture}
                  onChange={e => setMoisture(e.target.value)}
                  placeholder="e.g. 6.4"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Purity level (%)</label>
                <input
                  type="number"
                  value={purity}
                  onChange={e => setPurity(e.target.value)}
                  placeholder="e.g. 99.4"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Pack Weight (g)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 500"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Packet Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 1"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Sealing Condition</label>
                <input
                  type="text"
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  placeholder="e.g. Vacuum Sealed Foil"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                />
              </div>
            </div>
            {req.status !== 'Approved' && req.assignee && (
              <button
                onClick={handleSaveSpecs}
                className="bg-neutral-900 hover:bg-neutral-800 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Commit Physical Metrics
              </button>
            )}
          </div>
        )}

        {/* LAB & COURIER */}
        {activeSubTab === 'Lab & Courier' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Lab Testing & Courier Dispatch Waybill</span>
            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Laboratory Analysis Findings</label>
                <textarea
                  rows={2}
                  value={labResults}
                  onChange={e => setLabResults(e.target.value)}
                  placeholder="Pesticide screening matches EPA/EU export limits..."
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Courier Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    placeholder="DHL Express / FedEx"
                    disabled={req.status === 'Approved'}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Waybill Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DHL-2991-X"
                    disabled={req.status === 'Approved'}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>
            </div>
            {req.status !== 'Approved' && req.assignee && (
              <button
                onClick={handleSaveCourier}
                className="bg-neutral-900 hover:bg-neutral-800 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Commit Lab & Waybill Details
              </button>
            )}

            {/* Dispatch internal task */}
            {req.status !== 'Approved' && req.assignee && (
              <div className="bg-white p-3 border text-[10px] space-y-2 mt-2">
                <span className="font-bold uppercase text-[8px] text-neutral-400 block border-b pb-1">Dispatch background quarantine check tasks</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Verify physical cargo loading"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="bg-neutral-50 border p-1 focus:outline-none col-span-2"
                  />
                  <select
                    value={taskDept}
                    onChange={e => setTaskDept(e.target.value)}
                    className="bg-neutral-50 border p-1 focus:outline-none"
                  >
                    <option value="Compliance">Compliance Desk</option>
                    <option value="Logistics">Logistics Desk</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Instructions..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  className="bg-neutral-50 border p-1 focus:outline-none w-full"
                />
                <button
                  onClick={() => {
                    if (!taskTitle.trim() || !taskDesc.trim()) {
                      triggerToast('Title and instructions are required.');
                      return;
                    }
                    handleRequestSamplingInternalTask(
                      activeEnquiry.id,
                      `Sampling Check: ${taskTitle}`,
                      taskDept,
                      taskAssignee,
                      taskDesc,
                      'Medium',
                      taskDueDate
                    );
                    setTaskTitle('');
                    setTaskDesc('');
                  }}
                  className="bg-neutral-900 text-white uppercase text-[8px] px-2.5 py-1 font-bold"
                  type="button"
                >
                  + Dispatch Task
                </button>
              </div>
            )}
          </div>
        )}

        {/* TOTAL */}
        {activeSubTab === 'Total' && (
          <div className="space-y-4">
            <div className="bg-neutral-50 border p-3 space-y-2">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-900 block border-b pb-1">Final compiled quality sheet</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                <div><strong>Sample Type:</strong> {req.sampleType || 'Not set'}</div>
                <div><strong>Moisture %:</strong> {req.moisturePercentage || '0'}%</div>
                <div><strong>Purity %:</strong> {req.purityPercentage || '0'}%</div>
                <div><strong>Weight (grams):</strong> {req.weightGrams || '0'}g</div>
                <div><strong>Packet Quantity:</strong> {req.quantity || '0'}</div>
                <div><strong>Sealing Option:</strong> {req.condition || 'Not set'}</div>
                <div><strong>Carrier Courier:</strong> {req.carrier || 'Not set'}</div>
                <div><strong>Tracking Waybill:</strong> {req.trackingNumber || 'Not set'}</div>
              </div>
            </div>

            {req.status !== 'Approved' && req.status !== 'Ready for Review' ? (
              <div className="bg-neutral-50 border p-3 flex justify-between items-center">
                <span className="text-neutral-500">Freezes quality details and requests review.</span>
                <button
                  onClick={() => handleSubmitSamplingRequest(activeEnquiry.id)}
                  className="bg-neutral-950 text-white font-bold uppercase text-[9px] px-3 py-1.5"
                  type="button"
                >
                  Submit Sample for Head Review
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 text-center text-emerald-800 font-bold">
                {req.status === 'Approved' ? '✓ Sampling request was approved & Waybill generated.' : 'Awaiting Oliver Vance validation and release signature.'}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
