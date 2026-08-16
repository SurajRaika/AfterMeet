import React, { useState, useMemo, useEffect } from 'react';
import { Enquiry, User, Task, LogisticsRequest } from '../../types/crm';
import { ModuleDeskView, CustomView } from '../ModuleDeskView';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface OpsLogisticsViewProps {
  enquiries: Enquiry[];
  currentUser: User;
  triggerToast: (msg: string) => void;
  handleAssignLogisticsRequest: (enquiryId: string, assigneeName: string) => void;
  handleUpdateLogisticsDetails: (enquiryId: string, details: Partial<Omit<LogisticsRequest, 'id' | 'enquiryId' | 'comments' | 'documents' | 'internalRequests'>>) => void;
  handleSubmitLogisticsRequest: (enquiryId: string) => void;
  handleAddLogisticsComment: (enquiryId: string, text: string) => void;
  handleAddLogisticsDocument: (enquiryId: string, fileName: string) => void;
  handleRequestLogisticsInternalTask: (
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

interface FlatLogisticsItem {
  id: string;
  customerName: string;
  product: string;
  quantity: string;
  destinationPort: string;
  status: string;
  priority: string;
  assignee: string;
  carrier: string;
  bookingRef: string;
  vessel: string;
  originalEnquiry: Enquiry;
}

export function OpsLogisticsView({
  enquiries,
  currentUser,
  triggerToast,
  handleAssignLogisticsRequest,
  handleUpdateLogisticsDetails,
  handleSubmitLogisticsRequest,
  handleAddLogisticsComment,
  handleAddLogisticsDocument,
  handleRequestLogisticsInternalTask,
  setActiveTaskId,
}: OpsLogisticsViewProps) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');
  const [activeSubTab, setActiveTab] = useState<'Overview' | 'Vessel & Carrier' | 'Freight Cost' | 'Total'>('Overview');

  // Vessel form inputs
  const [containerType, setContainerType] = useState<'TEU' | 'FEU' | 'Other'>('TEU');
  const [carrier, setCarrier] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [vessel, setVessel] = useState('');
  const [voyage, setVoyage] = useState('');
  const [portInfo, setPortInfo] = useState('');
  const [loadingDate, setLoadingDate] = useState('');

  // Charges inputs
  const [freightCharges, setFreightCharges] = useState('');
  const [terminalCharges, setTerminalCharges] = useState('');

  // Internal tasks dispatch inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDept, setTaskDept] = useState('Compliance');
  const [taskAssignee, setTaskAssignee] = useState('Sophia Miller');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-28');

  // Comments/Doc inputs
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');

  const isManager = currentUser.department === 'Logistics' && currentUser.isManager;
  const isPresidentOrAdmin = currentUser.isPresident || currentUser.isAdmin;

  const logisticsEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      if (!e.logisticsRequest) return false;
      if (!isManager && !isPresidentOrAdmin) {
        return e.logisticsRequest.assignee === currentUser.name || e.logisticsRequest.assignee === '';
      }
      return true;
    });
  }, [enquiries, currentUser, isManager, isPresidentOrAdmin]);

  const stats = useMemo(() => {
    const list = enquiries.map(e => e.logisticsRequest).filter((r): r is Exclude<typeof r, undefined> => !!r);
    return [
      {
        label: 'Incoming Requests',
        value: list.filter(r => r.status === 'Requested').length,
        subtext: 'Pending booking/assignment'
      },
      {
        label: 'My Freight Bookings',
        value: list.filter(r => r.assignee === currentUser.name).length,
        subtext: 'Your ocean lines'
      },
      {
        label: 'Pending Total',
        value: list.filter(r => r.status !== 'Approved').length,
        subtext: 'Active pipeline'
      },
      {
        label: 'Shipped Vessel Slots',
        value: list.filter(r => r.status === 'Approved').length,
        subtext: 'Booking references sealed',
        subtextColorClass: 'text-emerald-600 font-bold'
      }
    ];
  }, [enquiries, currentUser]);

  const mappedData = useMemo<FlatLogisticsItem[]>(() => {
    return logisticsEnquiries.map(e => ({
      id: e.id,
      customerName: e.customerName,
      product: e.product,
      quantity: e.quantity,
      destinationPort: e.destinationPort,
      status: e.logisticsRequest?.status || 'Requested',
      priority: e.logisticsRequest?.priority || 'Medium',
      assignee: e.logisticsRequest?.assignee || 'Unassigned',
      carrier: e.logisticsRequest?.carrier || 'None',
      bookingRef: e.logisticsRequest?.bookingRef || 'Pending',
      vessel: e.logisticsRequest?.vessel || 'Pending',
      originalEnquiry: e,
    }));
  }, [logisticsEnquiries]);

  // Table Columns Setup
  const columns = useMemo<ColumnDef<FlatLogisticsItem>[]>(() => [
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
      id: 'destinationPort',
      accessorKey: 'destinationPort',
      header: 'Discharge Port',
      cell: info => <span className="font-mono">{info.getValue() as string}</span>,
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
      id: 'shippingDetails',
      header: 'Vessel Booking',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-medium">{row.carrier} ({row.vessel})</span>
            <span className="block text-[8px] font-mono text-neutral-400">Ref: {row.bookingRef}</span>
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

  // Kanban card renderer
  const renderKanbanCard = (item: FlatLogisticsItem, onSelect: () => void) => {
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
          <span className="text-neutral-500 text-[9px] block">Port: {item.destinationPort}</span>
        </div>

        <div className="text-[9px] border-t border-neutral-100 pt-1.5 space-y-0.5">
          <span className="block text-neutral-700">🚢 Carrier: <span className="font-bold">{item.carrier}</span></span>
          <span className="block text-neutral-400 font-mono text-[8px]">Booking Ref: {item.bookingRef}</span>
        </div>

        <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100 items-center justify-between">
          <span className="text-neutral-500 text-[8px]">Operator: {item.assignee}</span>
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
  const req = activeEnquiry?.logisticsRequest;

  // Sync inputs on selection
  useEffect(() => {
    if (req) {
      setContainerType(req.containerType || 'TEU');
      setCarrier(req.carrier || '');
      setBookingRef(req.bookingRef || '');
      setVessel(req.vessel || '');
      setVoyage(req.voyage || '');
      setPortInfo(req.portInfo || '');
      setLoadingDate(req.loadingDate || '');
      setFreightCharges(req.freightCharges ? req.freightCharges.toString() : '');
      setTerminalCharges(req.terminalCharges ? req.terminalCharges.toString() : '');
    }
  }, [req]);

  const handleSaveVessel = () => {
    if (!activeEnquiry) return;
    handleUpdateLogisticsDetails(activeEnquiry.id, {
      containerType,
      carrier,
      bookingRef,
      vessel,
      voyage,
      portInfo,
      loadingDate,
    });
  };

  const handleSaveCharges = () => {
    if (!activeEnquiry) return;
    handleUpdateLogisticsDetails(activeEnquiry.id, {
      freightCharges: parseFloat(freightCharges) || 0,
      terminalCharges: parseFloat(terminalCharges) || 0,
    });
  };

  // Custom views setup
  const fieldsForCustomView: { value: keyof FlatLogisticsItem; label: string }[] = [
    { value: 'customerName', label: 'Client Firm' },
    { value: 'destinationPort', label: 'Discharge Port' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'carrier', label: 'Shipping Line' }
  ];

  const defaultCustomViews: CustomView<FlatLogisticsItem>[] = [
    {
      id: 'view-high-priority-log',
      name: 'High Priority',
      conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
      isBuiltIn: true
    },
    {
      id: 'view-assigned-to-me-log',
      name: 'My Freight Bookings',
      conditions: [{ field: 'assignee', operator: 'equals', value: currentUser.name }],
      isBuiltIn: true
    }
  ];

  // Render list (Desk View)
  if (!selectedEnquiryId) {
    return (
      <ModuleDeskView<FlatLogisticsItem>
        title="Logistics Desk Tracking Queue"
        subtitle="Independent freight operations queue monitoring maritime carrier slot locks, inland freight quotes, and loading manifests."
        data={mappedData}
        columns={columns}
        kanbanColumns={['Requested', 'In Progress', 'Awaiting Inputs', 'Ready for Review', 'Submitted', 'Approved']}
        getKanbanColumnValue={item => item.status}
        onUpdateStatus={async (id, newStatus) => {
          const original = enquiries.find(e => e.id === id);
          if (original && original.logisticsRequest) {
            original.logisticsRequest.status = newStatus as any;
            triggerToast(`Logistics status updated to ${newStatus}`);
          }
        }}
        renderKanbanCard={renderKanbanCard}
        localStorageKey="aftermeet_logistics_custom_views"
        defaultCustomViews={defaultCustomViews}
        fieldsForCustomView={fieldsForCustomView}
        stats={stats}
        onItemSelect={(item) => {
          setSelectedEnquiryId(item.id);
          setActiveTab('Overview');
        }}
        globalSearchFields={['id', 'customerName', 'destinationPort', 'status', 'priority', 'assignee', 'carrier', 'bookingRef', 'vessel']}
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
          <span>Back to Logistics Desk</span>
        </button>
      </div>

      {/* Active Header Block */}
      <div className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 rounded-none">
        <div>
          <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase">Maritime Booking Hub</span>
          <h2 className="text-xs font-bold text-neutral-950 mt-1">
            {activeEnquiry.id} &mdash; {activeEnquiry.customerName}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 text-[9px]">
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Stage: <strong>{req.status}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Booking Ref: <strong>{req.bookingRef || 'Pending'}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Operator: <strong>{req.assignee || 'Unassigned'}</strong>
          </span>
        </div>
      </div>

      {/* Claim Button */}
      {!req.assignee && (
        <div className="bg-amber-50 border border-amber-200 p-3 flex justify-between items-center text-[10px]">
          <span className="text-amber-800 font-medium">This shipping request is currently unassigned. Claim it to start maritime vessel configurations.</span>
          <button
            onClick={() => handleAssignLogisticsRequest(activeEnquiry.id, currentUser.name)}
            className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold uppercase px-3 py-1 text-[9px]"
            type="button"
          >
            Claim Shipping Order
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5 overflow-x-auto">
        {(['Overview', 'Vessel & Carrier', 'Freight Cost', 'Total'] as const).map((tab) => (
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

      {/* Active Viewport */}
      <div className="p-4 border bg-white min-h-[350px] text-[10px] space-y-4">

        {/* OVERVIEW */}
        {activeSubTab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 border p-3">
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Target destination Port</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.destinationPort}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Cargo Sourcing Volume</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.quantity}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document upload list */}
              <div className="bg-neutral-50 border p-3 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Ocean Bills of Lading ({req.documents.length})</span>
                {req.documents.length === 0 ? (
                  <p className="text-neutral-400 italic text-[9px]">No shipping papers uploaded yet.</p>
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
                      placeholder="e.g. Draft_Bill_Of_Lading.pdf"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      className="bg-white border px-2 py-1 text-[9px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!docName.trim()) return;
                        handleAddLogisticsDocument(activeEnquiry.id, docName);
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

              {/* Discussion thread */}
              <div className="bg-neutral-50 border p-3 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Operational Remarks & Logs ({req.comments.length})</span>
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
                      placeholder="Add shipping updates..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="bg-white border px-2 py-1 text-[9px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!commentText.trim()) return;
                        handleAddLogisticsComment(activeEnquiry.id, commentText);
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

        {/* VESSEL & CARRIER */}
        {activeSubTab === 'Vessel & Carrier' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Vessel Slot & Carrier Allocations</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Container Type</label>
                <select
                  value={containerType}
                  onChange={e => setContainerType(e.target.value as any)}
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-bold"
                >
                  <option value="TEU">20ft (TEU)</option>
                  <option value="FEU">40ft (FEU)</option>
                  <option value="Other">LCL / Special Bulk</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Maritime Carrier</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  placeholder="e.g. ONE Line / Maersk"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Booking Reference</label>
                <input
                  type="text"
                  value={bookingRef}
                  onChange={e => setBookingRef(e.target.value)}
                  placeholder="e.g. BK-TDK-2921"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Vessel Name</label>
                <input
                  type="text"
                  value={vessel}
                  onChange={e => setVessel(e.target.value)}
                  placeholder="e.g. ONE Blue Ocean"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Voyage Number</label>
                <input
                  type="text"
                  value={voyage}
                  onChange={e => setVoyage(e.target.value)}
                  placeholder="e.g. V-092"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Port Terminal Info</label>
                <input
                  type="text"
                  value={portInfo}
                  onChange={e => setPortInfo(e.target.value)}
                  placeholder="e.g. Terminal 4, Port of Hamburg"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Loading Date</label>
                <input
                  type="date"
                  value={loadingDate}
                  onChange={e => setLoadingDate(e.target.value)}
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
            </div>
            {req.status !== 'Approved' && req.assignee && (
              <button
                onClick={handleSaveVessel}
                className="bg-neutral-900 hover:bg-neutral-800 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Commit Shipping & Vessel Details
              </button>
            )}
          </div>
        )}

        {/* FREIGHT COST */}
        {activeSubTab === 'Freight Cost' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Ocean Freight Charges Ledger</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Ocean Freight Charge (USD)</label>
                <input
                  type="number"
                  value={freightCharges}
                  onChange={e => setFreightCharges(e.target.value)}
                  placeholder="e.g. 3200"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Terminal Handling Charges (THC) (USD)</label>
                <input
                  type="number"
                  value={terminalCharges}
                  onChange={e => setTerminalCharges(e.target.value)}
                  placeholder="e.g. 450"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                />
              </div>
            </div>
            {req.status !== 'Approved' && req.assignee && (
              <button
                onClick={handleSaveCharges}
                className="bg-neutral-900 hover:bg-neutral-800 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Commit Freight Ledger Costs
              </button>
            )}

            {/* Internal task dispatch form */}
            {req.status !== 'Approved' && req.assignee && (
              <div className="bg-white p-3 border text-[10px] space-y-2 mt-2">
                <span className="font-bold uppercase text-[8px] text-neutral-400 block border-b pb-1">Dispatch internal compliance quarantine release tasks</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Validate phytosanitary stamp for freight loading"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="bg-neutral-50 border p-1 focus:outline-none col-span-2 font-medium"
                  />
                  <select
                    value={taskDept}
                    onChange={e => setTaskDept(e.target.value)}
                    className="bg-neutral-50 border p-1 focus:outline-none font-bold"
                  >
                    <option value="Compliance">Compliance Desk</option>
                    <option value="Sampling">Sampling Desk</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Detailed instructions..."
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
                    handleRequestLogisticsInternalTask(
                      activeEnquiry.id,
                      `Freight check: ${taskTitle}`,
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
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-900 block border-b pb-1">Final Compiled Shipping Manifesto</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                <div><strong>Carrier / Line:</strong> {req.carrier || 'Not set'}</div>
                <div><strong>Container Option:</strong> {req.containerType || 'Not set'}</div>
                <div><strong>Booking Reference:</strong> {req.bookingRef || 'Not set'}</div>
                <div><strong>Vessel Name:</strong> {req.vessel || 'Not set'} {req.voyage}</div>
                <div><strong>Loading Date SLA:</strong> {req.loadingDate || 'Not set'}</div>
                <div><strong>Terminal terminal:</strong> {req.portInfo || 'Not set'}</div>
                <div><strong>Base Freight charges:</strong> ${req.freightCharges || '0'}</div>
                <div><strong>Local handling terminal charges:</strong> ${req.terminalCharges || '0'}</div>
              </div>
            </div>

            {req.status !== 'Approved' && req.status !== 'Ready for Review' ? (
              <div className="bg-neutral-50 border p-3 flex justify-between items-center">
                <span className="text-neutral-500">Upon submission, transport rates will be frozen for Manager sign-off.</span>
                <button
                  onClick={() => handleSubmitLogisticsRequest(activeEnquiry.id)}
                  className="bg-neutral-950 text-white font-bold uppercase text-[9px] px-3 py-1.5"
                  type="button"
                >
                  Submit Logistics for Head Review
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 text-center text-emerald-800 font-bold">
                {req.status === 'Approved' ? '✓ Logistics plan APPROVED and booking reference locks secured.' : 'Awaiting Kenji Sato review and vessel loading authorization.'}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
