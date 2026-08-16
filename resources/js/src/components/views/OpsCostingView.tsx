import React, { useState, useMemo, useEffect } from 'react';
import { Enquiry, User, Task, CostingComponent } from '../../types/crm';
import { ModuleDeskView, CustomView } from '../ModuleDeskView';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface OpsCostingViewProps {
  enquiries: Enquiry[];
  currentUser: User;
  triggerToast: (msg: string) => void;
  handleAssignCostingRequest: (enquiryId: string, assigneeName: string) => void;
  handleUpdateCostingComponent: (
    enquiryId: string,
    componentId: string | null,
    name: string,
    cost: number,
    category: 'Packaging' | 'Transportation' | 'Procurement' | 'Logistics',
    notes?: string,
    isDelete?: boolean
  ) => void;
  handleRequestInternalTask: (
    enquiryId: string,
    title: string,
    department: string,
    assignee: string,
    description: string,
    priority: string,
    dueDate: string
  ) => void;
  handleSubmitCostingRequest: (enquiryId: string) => void;
  handleAddCostingComment: (enquiryId: string, text: string) => void;
  handleAddCostingDocument: (enquiryId: string, fileName: string) => void;
  setActiveTaskId: (id: string | null) => void;
}

interface FlatCostingItem {
  id: string;
  customerName: string;
  product: string;
  quantity: string;
  destinationPort: string;
  status: string;
  priority: string;
  assignee: string;
  salesOwner: string;
  originalEnquiry: Enquiry;
}

export function OpsCostingView({
  enquiries,
  currentUser,
  triggerToast,
  handleAssignCostingRequest,
  handleUpdateCostingComponent,
  handleRequestInternalTask,
  handleSubmitCostingRequest,
  handleAddCostingComment,
  handleAddCostingDocument,
  setActiveTaskId,
}: OpsCostingViewProps) {
  // Selected costing request from queue
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');

  // Active sub-tab inside the costing request page
  const [activeSubTab, setActiveTab] = useState<'Overview' | 'Packaging' | 'Transportation' | 'Procurement' | 'Logistics' | 'Total'>('Overview');

  // Input forms for appending costing components
  const [compName, setCompName] = useState('');
  const [compCost, setCompCost] = useState('');
  const [compNotes, setCompNotes] = useState('');

  // Structured internal task dispatch forms
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDept, setTaskDept] = useState('Logistics');
  const [taskAssignee, setTaskAssignee] = useState('Chloe Taylor');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-25');

  // Comments and attachment forms
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');

  // Filter requests list based on current user scope (employee sees assigned/unassigned)
  const isManager = currentUser.department === 'Costing' && currentUser.isManager;
  const isPresidentOrAdmin = currentUser.isPresident || currentUser.isAdmin;

  const costingEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      if (!e.costingRequest) return false;
      if (!isManager && !isPresidentOrAdmin) {
        return e.costingRequest.assignee === currentUser.name || e.costingRequest.assignee === '';
      }
      return true;
    });
  }, [enquiries, currentUser, isManager, isPresidentOrAdmin]);

  // Compute status summary metrics
  const stats = useMemo(() => {
    const list = enquiries.map(e => e.costingRequest).filter((r): r is Exclude<typeof r, undefined> => !!r);
    return [
      {
        label: 'Incoming Requests',
        value: list.filter(r => r.status === 'Requested').length,
        subtext: 'Awaiting analyst action'
      },
      {
        label: 'My Assigned Work',
        value: list.filter(r => r.assignee === currentUser.name).length,
        subtext: 'Your current load'
      },
      {
        label: 'Pending Total',
        value: list.filter(r => r.status !== 'Approved').length,
        subtext: 'Active workload'
      },
      {
        label: 'Overdue SLA',
        value: list.filter(r => {
          const due = new Date(r.dueDate);
          return due < new Date() && r.status !== 'Approved';
        }).length,
        subtext: 'Requires immediate action',
        subtextColorClass: 'text-red-600 font-bold'
      }
    ];
  }, [enquiries, currentUser]);

  // Map to flat structure for ModuleDeskView
  const mappedData = useMemo<FlatCostingItem[]>(() => {
    return costingEnquiries.map(e => ({
      id: e.id,
      customerName: e.customerName,
      product: e.product,
      quantity: e.quantity,
      destinationPort: e.destinationPort,
      status: e.costingRequest?.status || 'Requested',
      priority: e.costingRequest?.priority || 'Medium',
      assignee: e.costingRequest?.assignee || 'Unassigned',
      salesOwner: e.salesOwner,
      originalEnquiry: e,
    }));
  }, [costingEnquiries]);

  // TanStack Column Definitions
  const columns = useMemo<ColumnDef<FlatCostingItem>[]>(() => [
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
      header: 'Product Specification',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-medium">{row.product}</span>
            <span className="block text-neutral-400 text-[9px]">Sourcing Volume: {row.quantity}</span>
          </div>
        );
      }
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
      id: 'assignee',
      accessorKey: 'assignee',
      header: 'Assignee',
      cell: info => <span className="font-medium text-neutral-600">{info.getValue() as string}</span>,
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
  const renderKanbanCard = (item: FlatCostingItem, onSelect: () => void) => {
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
          <span className="text-neutral-500 text-[9px] block">Owner: {item.salesOwner}</span>
        </div>

        <div className="text-[9px] border-t border-neutral-100 pt-1.5 space-y-0.5">
          <span className="block text-neutral-700">📦 Crop: <span className="font-bold">{item.product}</span></span>
          <span className="block text-neutral-400">⚖ Vol: {item.quantity}</span>
        </div>

        <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100 items-center justify-between">
          <span className="text-neutral-500 text-[8px]">Assignee: {item.assignee}</span>
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
  const req = activeEnquiry?.costingRequest;

  // Sync state if active enquiry selected
  useEffect(() => {
    if (activeEnquiry && req) {
      setCompName('');
      setCompCost('');
      setCompNotes('');
    }
  }, [selectedEnquiryId, req, activeEnquiry]);

  // Header options for views
  const fieldsForCustomView: { value: keyof FlatCostingItem; label: string }[] = [
    { value: 'customerName', label: 'Client Firm' },
    { value: 'product', label: 'Product Specification' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' }
  ];

  const defaultCustomViews: CustomView<FlatCostingItem>[] = [
    {
      id: 'view-high-priority',
      name: 'High Priority',
      conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
      isBuiltIn: true
    },
    {
      id: 'view-assigned-to-me',
      name: 'My Calculations',
      conditions: [{ field: 'assignee', operator: 'equals', value: currentUser.name }],
      isBuiltIn: true
    }
  ];

  // Render list (Desk View) or workspace (Detail View) based on selectedId state
  if (!selectedEnquiryId) {
    return (
      <ModuleDeskView<FlatCostingItem>
        title="Costing Desk Tracking Queue"
        subtitle="Independent trade workspace monitoring costing requests, raw product specifications, and background calculations."
        data={mappedData}
        columns={columns}
        kanbanColumns={['Requested', 'In Progress', 'Awaiting Inputs', 'Ready for Review', 'Submitted', 'Approved']}
        getKanbanColumnValue={item => item.status}
        onUpdateStatus={async (id, newStatus) => {
          // Find original and update
          const original = enquiries.find(e => e.id === id);
          if (original && original.costingRequest) {
            // Update the status or assign if unassigned
            original.costingRequest.status = newStatus as any;
            triggerToast(`Costing status updated to ${newStatus}`);
          }
        }}
        renderKanbanCard={renderKanbanCard}
        localStorageKey="aftermeet_costing_custom_views"
        defaultCustomViews={defaultCustomViews}
        fieldsForCustomView={fieldsForCustomView}
        stats={stats}
        onItemSelect={(item) => {
          setSelectedEnquiryId(item.id);
          setActiveTab('Overview');
        }}
        globalSearchFields={['id', 'customerName', 'product', 'status', 'priority', 'assignee']}
      />
    );
  }

  // Render detailed workspace (Detail View)
  if (!activeEnquiry || !req) return null;

  const handleDispatchDepartmentTask = (targetDept: string, defaultAssignee: string) => {
    if (!taskTitle.trim() || !taskDesc.trim()) {
      triggerToast('Please provide a title and description for the request.');
      return;
    }
    handleRequestInternalTask(
      activeEnquiry.id,
      `${activeSubTab}: ${taskTitle}`,
      targetDept,
      defaultAssignee,
      taskDesc,
      taskPriority,
      taskDueDate
    );
    setTaskTitle('');
    setTaskDesc('');
  };

  const getFilteredTasksForTab = (tab: string) => {
    switch (tab) {
      case 'Overview':
        return req.internalRequests;
      case 'Packaging':
        return req.internalRequests.filter(t => t.title.toLowerCase().includes('packaging') || t.description.toLowerCase().includes('packaging'));
      case 'Transportation':
        return req.internalRequests.filter(t => t.title.toLowerCase().includes('transportation') || t.description.toLowerCase().includes('transportation'));
      case 'Procurement':
        return req.internalRequests.filter(t => t.title.toLowerCase().includes('procurement') || t.description.toLowerCase().includes('procurement'));
      case 'Logistics':
        return req.internalRequests.filter(t => t.title.toLowerCase().includes('logistics') || t.description.toLowerCase().includes('logistics'));
      default:
        return req.internalRequests;
    }
  };

  const renderDepartmentInteractionBox = (tab: string, deptName: string, defaultAssignee: string) => {
    const tasks = getFilteredTasksForTab(tab);

    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Dispatch request form */}
          <div className="bg-neutral-50 p-3 border border-neutral-200 text-[10px] space-y-2">
            <span className="font-bold block uppercase text-[8px] text-neutral-400">Request {deptName} Action / Verification</span>
            <div className="space-y-1.5">
              <div>
                <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Request Title</label>
                <input
                  type="text"
                  placeholder={`e.g., Secure ${deptName} details`}
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Instruction Notes</label>
                <textarea
                  placeholder={`Instruction details for ${deptName}...`}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-white border p-1 text-[10px] focus:outline-none h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-white border p-1 text-[10px] focus:outline-none font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => handleDispatchDepartmentTask(deptName, defaultAssignee)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-1 text-[9px] transition-colors"
                type="button"
              >
                + Dispatch Request to {deptName} Desk
              </button>
            </div>
          </div>

          {/* Connected task checklist & chat workspace */}
          <div className="space-y-2">
            <span className="font-bold text-[8px] uppercase text-neutral-400 block border-b pb-1">Active Tasks & Workspace Chat ({tasks.length})</span>
            {tasks.length === 0 ? (
              <p className="text-neutral-400 italic text-[10px] py-4 text-center">No active background duties or requests found for {deptName}.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {tasks.map(t => (
                  <div key={t.id} className="p-2 border bg-neutral-50 flex justify-between items-center text-[10px] hover:bg-neutral-100 transition-colors">
                    <div>
                      <span className="font-bold block text-neutral-900">{t.title} ({t.id})</span>
                      <span className="text-[9px] text-neutral-500">Assignee: {t.assignee} &bull; Due: {t.dueDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTaskId(t.id)}
                        className="bg-white border border-neutral-300 hover:bg-neutral-50 px-2 py-0.5 text-[8px] font-bold uppercase transition-colors"
                        type="button"
                      >
                        Workspace Chat
                      </button>
                      <span className="bg-neutral-200 border px-1 py-0.5 font-mono text-[8px] uppercase font-bold">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Back to Desk bar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setSelectedEnquiryId('')}
          className="flex items-center space-x-1 text-neutral-600 hover:text-black font-bold uppercase text-[10px]"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Costing Desk</span>
        </button>
      </div>

      {/* Header Context Bar */}
      <div className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 rounded-none">
        <div>
          <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase">Costing Workspace</span>
          <h2 className="text-xs font-bold text-neutral-950 mt-1">
            {activeEnquiry.id} &mdash; {activeEnquiry.customerName}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 text-[9px]">
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Scope Status: <strong className="text-neutral-950">{req.status}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Priority: <strong>{req.priority}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Target Due: <strong className="font-mono">{req.dueDate}</strong>
          </span>
        </div>
      </div>

      {/* Action to Claim */}
      {!req.assignee && (
        <div className="bg-amber-50 border border-amber-200 p-3 flex justify-between items-center text-[10px]">
          <span className="text-amber-800 font-medium">This costing request is currently unassigned. Claim it to record components.</span>
          <button
            onClick={() => handleAssignCostingRequest(activeEnquiry.id, currentUser.name)}
            className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold uppercase px-3 py-1 text-[9px]"
            type="button"
          >
            Claim Calculation Request
          </button>
        </div>
      )}

      {/* Navigation tabs inside the workspace */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5 rounded-none overflow-x-auto">
        {(['Overview', 'Packaging', 'Transportation', 'Procurement', 'Logistics', 'Total'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCompName('');
              setCompCost('');
              setCompNotes('');
            }}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase shrink-0 rounded-none transition-colors ${
              activeSubTab === tab
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Viewport for active tab */}
      <div className="bg-white border border-neutral-200 p-4 rounded-none min-h-[350px]">

        {/* 1. OVERVIEW TAB */}
        {activeSubTab === 'Overview' && (
          <div className="space-y-4 text-[10px]">
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 border p-3">
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Target Destination Port</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.destinationPort}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Product Specification</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.product} ({activeEnquiry.quantity})</span>
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Sales Instruction Notes</span>
                <span className="text-neutral-800 italic font-medium">"{req.salesNote}"</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document upload list */}
              <div className="border p-3 bg-neutral-50 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Costing Spreadsheet Attachments ({req.documents.length})</span>
                {req.documents.length === 0 ? (
                  <p className="text-neutral-400 italic text-[9px]">No spreadsheets attached yet.</p>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
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
                      placeholder="e.g. Sourcing_Quote_Sheet.xlsx"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!docName.trim()) return;
                        handleAddCostingDocument(activeEnquiry.id, docName);
                        setDocName('');
                      }}
                      className="bg-neutral-950 text-white font-bold uppercase text-[8px] px-2 py-1"
                      type="button"
                    >
                      Attach
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Feed thread */}
              <div className="border p-3 bg-neutral-50 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Calculation Remarks & Discussion ({req.comments.length})</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {req.comments.map(c => (
                    <div key={c.id} className="bg-white p-2 border text-[9px]">
                      <p className="text-neutral-800 font-medium">{c.text}</p>
                      <span className="text-[8px] text-neutral-400 block mt-0.5">By: {c.author} &bull; {c.date}</span>
                    </div>
                  ))}
                </div>
                {req.status !== 'Approved' && (
                  <div className="flex gap-1 pt-1.5 border-t">
                    <input
                      type="text"
                      placeholder="Comment on calculations..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="bg-white border p-1 text-[10px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!commentText.trim()) return;
                        handleAddCostingComment(activeEnquiry.id, commentText);
                        setCommentText('');
                      }}
                      className="bg-neutral-950 text-white font-bold uppercase text-[8px] px-2 py-1"
                      type="button"
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </div>
            {renderDepartmentInteractionBox('Overview', 'Costing', 'Sarah Jenkins')}
          </div>
        )}

        {/* 2-5. WORK TABS (Packaging, Transportation, Procurement, Logistics) */}
        {['Packaging', 'Transportation', 'Procurement', 'Logistics'].includes(activeSubTab) && (
          <div className="space-y-4 text-[10px]">
            <div className="bg-neutral-50 border p-3 space-y-3">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Current {activeSubTab} Cost Items</span>
              {req.components.filter(c => c.category === activeSubTab).length === 0 ? (
                <p className="text-neutral-400 italic py-2">No costing components entered for {activeSubTab} yet.</p>
              ) : (
                <div className="space-y-1">
                  {req.components.filter(c => c.category === activeSubTab).map(c => (
                    <div key={c.id} className="flex justify-between items-center py-1.5 bg-white px-2 border">
                      <div>
                        <strong className="text-neutral-900">{c.name}</strong>
                        {c.notes && <span className="text-neutral-400 text-[8px] block">{c.notes}</span>}
                      </div>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="font-bold text-neutral-950">${c.cost.toLocaleString()}</span>
                        {req.status !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateCostingComponent(activeEnquiry.id, c.id, '', 0, activeSubTab as any, '', true)}
                            className="text-red-600 hover:text-red-800 font-bold"
                            type="button"
                          >
                            × Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add costing factor inside this category */}
              {req.status !== 'Approved' && req.assignee && (
                <div className="bg-white p-3 border text-[10px] space-y-2 mt-2">
                  <span className="font-bold uppercase text-[8px] text-neutral-400 block">Insert {activeSubTab} Cost Factor</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder={`e.g. ${activeSubTab} item cost name`}
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="bg-white border p-1 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Cost in USD"
                      value={compCost}
                      onChange={(e) => setCompCost(e.target.value)}
                      className="bg-white border p-1 focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Optional reference notes"
                      value={compNotes}
                      onChange={(e) => setCompNotes(e.target.value)}
                      className="bg-white border p-1 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!compName.trim() || !compCost.trim()) {
                        triggerToast('Provide valid item name and numeric cost value.');
                        return;
                      }
                      handleUpdateCostingComponent(
                        activeEnquiry.id,
                        null,
                        compName,
                        parseFloat(compCost),
                        activeSubTab as any,
                        compNotes
                      );
                      setCompName('');
                      setCompCost('');
                      setCompNotes('');
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1 text-[8px]"
                    type="button"
                  >
                    + Append Component Cost
                  </button>
                </div>
              )}
            </div>

            {renderDepartmentInteractionBox(activeSubTab, 'Costing', 'Sarah Jenkins')}
          </div>
        )}

        {/* 6. TOTAL TAB */}
        {activeSubTab === 'Total' && (
          <div className="space-y-4 text-[10px]">
            <div className="border-b pb-2">
              <span className="font-bold uppercase text-[9px] text-neutral-900 block">Final compiled cost sheet</span>
              <p className="text-neutral-500 text-[9px]">Validate all cost components compiled across the departments before submitting.</p>
            </div>

            <div className="bg-neutral-50 border p-3 space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] uppercase font-bold text-neutral-400 border-b pb-1.5">
                <div>Category</div>
                <div>Cost Items Count</div>
                <div>Subtotal Cost</div>
                <div>Status</div>
              </div>

              {['Packaging', 'Transportation', 'Procurement', 'Logistics'].map(cat => {
                const items = req.components.filter(c => c.category === cat);
                const sum = items.reduce((s, i) => s + i.cost, 0);
                return (
                  <div key={cat} className="grid grid-cols-4 gap-2 text-center py-1.5 border-b text-[10px]">
                    <div className="font-bold text-neutral-900 text-left md:text-center">{cat}</div>
                    <div>{items.length}</div>
                    <div className="font-mono font-bold text-neutral-950">${sum.toLocaleString()}</div>
                    <div className="text-emerald-700 font-bold font-mono">Ready</div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2 font-mono font-bold text-[11px] border-t">
                <span>Grand Sourcing Cost Total:</span>
                <span className="text-neutral-950 font-black">${req.components.reduce((sum, c) => sum + c.cost, 0).toLocaleString()} / MT</span>
              </div>
            </div>

            {/* Submission controls */}
            {req.status !== 'Approved' && req.status !== 'Ready for Review' ? (
              <div className="bg-neutral-50 border p-3 space-y-2">
                <span className="font-bold block uppercase text-[8px] text-neutral-400">Review sign-off</span>
                <p className="text-neutral-500">Upon submission, compiled models will be frozen and routed to the Costing Manager for review & sign-off.</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSubmitCostingRequest(activeEnquiry.id)}
                    className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase px-4 py-2 text-[10px]"
                    type="button"
                  >
                    Submit compiled Costing for Manager Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 text-center text-emerald-800">
                {req.status === 'Approved' ? (
                  <strong>✓ Costing request was successfully approved and locked.</strong>
                ) : (
                  <strong>Awaiting Manager Review and validation of costing spreadsheet models.</strong>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
