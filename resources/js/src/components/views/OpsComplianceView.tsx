import React, { useState, useMemo, useEffect } from 'react';
import { Enquiry, User, Task, ComplianceRequest } from '../../types/crm';
import { ModuleDeskView, CustomView } from '../ModuleDeskView';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface OpsComplianceViewProps {
  enquiries: Enquiry[];
  currentUser: User;
  triggerToast: (msg: string) => void;
  handleAssignComplianceRequest: (enquiryId: string, assigneeName: string) => void;
  handleUpdateComplianceDetails: (enquiryId: string, details: Partial<Omit<ComplianceRequest, 'id' | 'enquiryId' | 'comments' | 'documents' | 'internalRequests'>>) => void;
  handleSubmitComplianceRequest: (enquiryId: string) => void;
  handleAddComplianceComment: (enquiryId: string, text: string) => void;
  handleAddComplianceDocument: (enquiryId: string, fileName: string) => void;
  handleRequestComplianceInternalTask: (
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

interface FlatComplianceItem {
  id: string;
  customerName: string;
  product: string;
  quantity: string;
  status: string;
  priority: string;
  assignee: string;
  vendorDocsStatus: string;
  quarantineStatus: string;
  vendorName: string;
  vendorScore: string;
  originalEnquiry: Enquiry;
}

export function OpsComplianceView({
  enquiries,
  currentUser,
  triggerToast,
  handleAssignComplianceRequest,
  handleUpdateComplianceDetails,
  handleSubmitComplianceRequest,
  handleAddComplianceComment,
  handleAddComplianceDocument,
  handleRequestComplianceInternalTask,
  setActiveTaskId,
}: OpsComplianceViewProps) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');
  const [activeSubTab, setActiveTab] = useState<'Overview' | 'Coop Audit' | 'Checklist' | 'Total'>('Overview');

  // Audit inputs
  const [vendorDocsStatus, setVendorDocsStatus] = useState('');
  const [quarantineStatus, setQuarantineStatus] = useState('');
  const [farmSanitationPassed, setFarmSanitationPassed] = useState(true);
  const [findings, setFindings] = useState('');

  // Checklist verification
  const [docsVerified, setDocsVerified] = useState(false);
  const [quarantineApproved, setQuarantineApproved] = useState(false);
  const [sanitationPassed, setSanitationPassed] = useState(false);
  const [certificatesStamped, setCertificatesStamped] = useState(false);

  // Internal tasks dispatch inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDept, setTaskDept] = useState('Logistics');
  const [taskAssignee, setTaskAssignee] = useState('Chloe Taylor');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-28');

  // Comments/Doc inputs
  const [commentText, setCommentText] = useState('');
  const [docName, setDocName] = useState('');

  const isManager = currentUser.department === 'Compliance' && currentUser.isManager;
  const isPresidentOrAdmin = currentUser.isPresident || currentUser.isAdmin;

  const complianceEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      if (!e.complianceRequest) return false;
      if (!isManager && !isPresidentOrAdmin) {
        return e.complianceRequest.assignee === currentUser.name || e.complianceRequest.assignee === '';
      }
      return true;
    });
  }, [enquiries, currentUser, isManager, isPresidentOrAdmin]);

  const stats = useMemo(() => {
    const list = enquiries.map(e => e.complianceRequest).filter((r): r is Exclude<typeof r, undefined> => !!r);
    return [
      {
        label: 'Incoming Cases',
        value: list.filter(r => r.status === 'Requested').length,
        subtext: 'Pending review/assignment'
      },
      {
        label: 'My Active Cases',
        value: list.filter(r => r.assignee === currentUser.name).length,
        subtext: 'Your current load'
      },
      {
        label: 'Pending Total',
        value: list.filter(r => r.status !== 'Approved').length,
        subtext: 'Active pipeline'
      },
      {
        label: 'Sealed Certificates',
        value: list.filter(r => r.status === 'Approved').length,
        subtext: 'Agronomic releases stamped',
        subtextColorClass: 'text-emerald-600 font-bold'
      }
    ];
  }, [enquiries, currentUser]);

  const mappedData = useMemo<FlatComplianceItem[]>(() => {
    return complianceEnquiries.map(e => ({
      id: e.id,
      customerName: e.customerName,
      product: e.product,
      quantity: e.quantity,
      status: e.complianceRequest?.status || 'Requested',
      priority: e.complianceRequest?.priority || 'Medium',
      assignee: e.complianceRequest?.assignee || 'Unassigned',
      vendorDocsStatus: e.complianceRequest?.vendorDocsStatus || 'In Review',
      quarantineStatus: e.complianceRequest?.quarantineStatus || 'Pending',
      vendorName: e.vendorApproval.vendorName,
      vendorScore: e.vendorApproval.score,
      originalEnquiry: e,
    }));
  }, [complianceEnquiries]);

  // Columns setup
  const columns = useMemo<ColumnDef<FlatComplianceItem>[]>(() => [
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
      id: 'vendorName',
      accessorKey: 'vendorName',
      header: 'Farming Cooperative',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-semibold">{row.vendorName}</span>
            <span className="block text-[8px] font-mono text-neutral-400">Score: {row.vendorScore}</span>
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
      header: 'Assigned Clerk',
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

  // Kanban card renderer
  const renderKanbanCard = (item: FlatComplianceItem, onSelect: () => void) => {
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
          <span className="text-neutral-500 text-[9px] block">Coop: {item.vendorName}</span>
        </div>

        <div className="text-[9px] border-t border-neutral-100 pt-1.5 space-y-0.5">
          <span className="block text-neutral-700 font-medium">⚖ Doc Status: {item.vendorDocsStatus}</span>
          <span className="block text-neutral-400 font-mono text-[8px]">Quarantine: {item.quarantineStatus}</span>
        </div>

        <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100 items-center justify-between">
          <span className="text-neutral-500 text-[8px]">Clerk: {item.assignee}</span>
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
  const req = activeEnquiry?.complianceRequest;

  // Sync inputs on selection
  useEffect(() => {
    if (req) {
      setVendorDocsStatus(req.vendorDocsStatus || 'In Review');
      setQuarantineStatus(req.quarantineStatus || 'Pending');
      setFarmSanitationPassed(req.farmSanitationPassed !== undefined ? req.farmSanitationPassed : true);
      setFindings(req.findings || '');
      setDocsVerified(req.checklist?.docsVerified || false);
      setQuarantineApproved(req.checklist?.quarantineApproved || false);
      setSanitationPassed(req.checklist?.sanitationPassed || false);
      setCertificatesStamped(req.checklist?.certificatesStamped || false);
    }
  }, [req]);

  const handleSaveAudit = () => {
    if (!activeEnquiry) return;
    handleUpdateComplianceDetails(activeEnquiry.id, {
      vendorDocsStatus,
      quarantineStatus,
      farmSanitationPassed,
      findings,
    });
  };

  const handleSaveChecklist = () => {
    if (!activeEnquiry) return;
    handleUpdateComplianceDetails(activeEnquiry.id, {
      checklist: {
        docsVerified,
        quarantineApproved,
        sanitationPassed,
        certificatesStamped,
      },
    });
  };

  // Custom views setup
  const fieldsForCustomView: { value: keyof FlatComplianceItem; label: string }[] = [
    { value: 'customerName', label: 'Client Firm' },
    { value: 'vendorName', label: 'Cooperative' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' }
  ];

  const defaultCustomViews: CustomView<FlatComplianceItem>[] = [
    {
      id: 'view-high-priority-comp',
      name: 'High Priority',
      conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
      isBuiltIn: true
    },
    {
      id: 'view-assigned-to-me-comp',
      name: 'My Audits',
      conditions: [{ field: 'assignee', operator: 'equals', value: currentUser.name }],
      isBuiltIn: true
    }
  ];

  // Render list (Desk View)
  if (!selectedEnquiryId) {
    return (
      <ModuleDeskView<FlatComplianceItem>
        title="Compliance Desk Tracking Queue"
        subtitle="Independent quarantine clearance console monitoring cooperative farm sanitary licenses, chemical residue testing, and customs releases."
        data={mappedData}
        columns={columns}
        kanbanColumns={['Requested', 'In Progress', 'Awaiting Inputs', 'Ready for Review', 'Submitted', 'Approved']}
        getKanbanColumnValue={item => item.status}
        onUpdateStatus={async (id, newStatus) => {
          const original = enquiries.find(e => e.id === id);
          if (original && original.complianceRequest) {
            original.complianceRequest.status = newStatus as any;
            triggerToast(`Compliance status updated to ${newStatus}`);
          }
        }}
        renderKanbanCard={renderKanbanCard}
        localStorageKey="aftermeet_compliance_custom_views"
        defaultCustomViews={defaultCustomViews}
        fieldsForCustomView={fieldsForCustomView}
        stats={stats}
        onItemSelect={(item) => {
          setSelectedEnquiryId(item.id);
          setActiveTab('Overview');
        }}
        globalSearchFields={['id', 'customerName', 'vendorName', 'status', 'priority', 'assignee', 'vendorDocsStatus', 'quarantineStatus']}
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
          <span>Back to Compliance Desk</span>
        </button>
      </div>

      {/* Active Header Block */}
      <div className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 rounded-none">
        <div>
          <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase">Quarantine Release Hub</span>
          <h2 className="text-xs font-bold text-neutral-950 mt-1">
            {activeEnquiry.id} &mdash; {activeEnquiry.customerName}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 text-[9px]">
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Stage: <strong>{req.status}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Coop: <strong>{activeEnquiry.vendorApproval.vendorName}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Clerk: <strong>{req.assignee || 'Unassigned'}</strong>
          </span>
        </div>
      </div>

      {/* Claim Button */}
      {!req.assignee && (
        <div className="bg-amber-50 border border-amber-200 p-3 flex justify-between items-center text-[10px]">
          <span className="text-amber-800 font-medium">This quarantine request is currently unassigned. Claim it to start agronomic audits.</span>
          <button
            onClick={() => handleAssignComplianceRequest(activeEnquiry.id, currentUser.name)}
            className="bg-neutral-950 hover:bg-neutral-850 text-white font-bold uppercase px-3 py-1 text-[9px]"
            type="button"
          >
            Claim & Audit Cooperative
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5 overflow-x-auto">
        {(['Overview', 'Coop Audit', 'Checklist', 'Total'] as const).map((tab) => (
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
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Agronomic Sourcing Cooperative</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.vendorApproval.vendorName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[8px] uppercase font-bold">Verification Rating</span>
                <span className="font-bold text-neutral-900">{activeEnquiry.vendorApproval.score}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document upload list */}
              <div className="bg-neutral-50 border p-3 space-y-2">
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Phytosanitary & Sourcing Certificates ({req.documents.length})</span>
                {req.documents.length === 0 ? (
                  <p className="text-neutral-400 italic text-[9px]">No certificates uploaded.</p>
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
                      placeholder="e.g. Sanitation_Inspection_Clearance.pdf"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      className="bg-white border px-2 py-1 text-[9px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!docName.trim()) return;
                        handleAddComplianceDocument(activeEnquiry.id, docName);
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
                <span className="font-bold text-[9px] uppercase text-neutral-400 block border-b pb-1">Quarantine Feed Remarks ({req.comments.length})</span>
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
                      placeholder="Add quarantine details..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="bg-white border px-2 py-1 text-[9px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!commentText.trim()) return;
                        handleAddComplianceComment(activeEnquiry.id, commentText);
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

        {/* COOP AUDIT */}
        {activeSubTab === 'Coop Audit' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Agronomic Inspection & Quarantine Status</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Cooperative Document Review Status</label>
                <input
                  type="text"
                  value={vendorDocsStatus}
                  onChange={e => setVendorDocsStatus(e.target.value)}
                  placeholder="e.g. In Review / Verified"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">National Quarantine Status</label>
                <input
                  type="text"
                  value={quarantineStatus}
                  onChange={e => setQuarantineStatus(e.target.value)}
                  placeholder="e.g. Passed Lab Inspection"
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none font-medium"
                />
              </div>
              <div className="col-span-2 pt-1.5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={farmSanitationPassed}
                    onChange={e => setFarmSanitationPassed(e.target.checked)}
                    disabled={req.status === 'Approved'}
                    className="bg-white border focus:outline-none h-3.5 w-3.5"
                  />
                  <span className="font-bold text-[10px] text-neutral-800">Physical Farm Sanitation Audited & Passed</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Detailed Audit Findings</label>
                <textarea
                  rows={2}
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  placeholder="Audit findings notes..."
                  disabled={req.status === 'Approved'}
                  className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                />
              </div>
            </div>
            {req.status !== 'Approved' && req.assignee && (
              <button
                onClick={handleSaveAudit}
                className="bg-neutral-900 hover:bg-neutral-800 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Commit Audit Findings
              </button>
            )}
          </div>
        )}

        {/* CHECKLIST */}
        {activeSubTab === 'Checklist' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Export clearance verification checklist</span>
            <div className="space-y-3 bg-white p-2.5 border">
              <label className="flex items-center space-x-3 cursor-pointer p-1.5 hover:bg-neutral-50 border border-neutral-100">
                <input
                  type="checkbox"
                  checked={docsVerified}
                  onChange={e => setDocsVerified(e.target.checked)}
                  disabled={req.status === 'Approved'}
                  className="h-4 w-4"
                />
                <div>
                  <strong className="block text-[10px]">Cooperative Land Deeds & Agronomic Licences Verified</strong>
                  <span className="text-[8px] text-neutral-400 block">Confirms legitimate ownership and registration with the regional agricultural boards.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-1.5 hover:bg-neutral-50 border border-neutral-100">
                <input
                  type="checkbox"
                  checked={quarantineApproved}
                  onChange={e => setQuarantineApproved(e.target.checked)}
                  disabled={req.status === 'Approved'}
                  className="h-4 w-4"
                />
                <div>
                  <strong className="block text-[10px]">National Quarantine Lab Seal Approved</strong>
                  <span className="text-[8px] text-neutral-400 block">Confirms phytosanitary testing cleared cargo of weevils, mold, and invasive spores.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-1.5 hover:bg-neutral-50 border border-neutral-100">
                <input
                  type="checkbox"
                  checked={sanitationPassed}
                  onChange={e => setSanitationPassed(e.target.checked)}
                  disabled={req.status === 'Approved'}
                  className="h-4 w-4"
                />
                <div>
                  <strong className="block text-[10px]">Processing & Dehydration Plant Sanitation Certified</strong>
                  <span className="text-[8px] text-neutral-400 block">Ensures milling/drying facilities meet GMP, ISO, and global safety standards.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-1.5 hover:bg-neutral-50 border border-neutral-100">
                <input
                  type="checkbox"
                  checked={certificatesStamped}
                  onChange={e => setCertificatesStamped(e.target.checked)}
                  disabled={req.status === 'Approved'}
                  className="h-4 w-4"
                />
                <div>
                  <strong className="block text-[10px]">Phytosanitary Export Stamp Sealed</strong>
                  <span className="text-[8px] text-neutral-400 block">Authorizes port customs handlers to release the cargo containers for vessel boarding.</span>
                </div>
              </label>
            </div>
            {req.status !== 'Approved' && req.assignee && (
              <button
                onClick={handleSaveChecklist}
                className="bg-neutral-900 hover:bg-neutral-800 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Commit Checklist State
              </button>
            )}

            {/* Dispatch internal tasks */}
            {req.status !== 'Approved' && req.assignee && (
              <div className="bg-white p-3 border text-[10px] space-y-2 mt-2">
                <span className="font-bold uppercase text-[8px] text-neutral-400 block border-b pb-1">Dispatch internal logistics booking/document check</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Validate container loading seal paperwork"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="bg-neutral-50 border p-1 focus:outline-none col-span-2 font-medium"
                  />
                  <select
                    value={taskDept}
                    onChange={e => setTaskDept(e.target.value)}
                    className="bg-neutral-50 border p-1 focus:outline-none font-bold"
                  >
                    <option value="Logistics">Logistics Desk</option>
                    <option value="Sampling">Sampling Desk</option>
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
                    handleRequestComplianceInternalTask(
                      activeEnquiry.id,
                      `Compliance Check: ${taskTitle}`,
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
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-900 block border-b pb-1">Final compiled compliance certificate package</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                <div><strong>Quarantine Status:</strong> {req.quarantineStatus || 'Not set'}</div>
                <div><strong>Document Status:</strong> {req.vendorDocsStatus || 'Not set'}</div>
                <div><strong>Farm Sanitation Pass:</strong> {req.farmSanitationPassed ? 'YES ✓' : 'NO'}</div>
                <div><strong>Checklist Progress:</strong>
                  <ul className="list-disc pl-4 text-[9px]">
                    <li>Cooperative Licences Verified: {req.checklist?.docsVerified ? 'Yes ✓' : 'No'}</li>
                    <li>Lab Seal Approved: {req.checklist?.quarantineApproved ? 'Yes ✓' : 'No'}</li>
                    <li>Plant Sanitation Certified: {req.checklist?.sanitationPassed ? 'Yes ✓' : 'No'}</li>
                    <li>Stamp Sealed: {req.checklist?.certificatesStamped ? 'Yes ✓' : 'No'}</li>
                  </ul>
                </div>
                <div className="col-span-2 border-t pt-2 mt-1"><strong>Detailed Audit Findings:</strong> <p className="italic text-neutral-700">"{req.findings || 'No findings recorded.'}"</p></div>
              </div>
            </div>

            {req.status !== 'Approved' && req.status !== 'Ready for Review' ? (
              <div className="bg-neutral-50 border p-3 flex justify-between items-center">
                <span className="text-neutral-500">Freezes checklist items and requests review.</span>
                <button
                  onClick={() => handleSubmitComplianceRequest(activeEnquiry.id)}
                  className="bg-neutral-950 text-white font-bold uppercase text-[9px] px-3 py-1.5"
                  type="button"
                >
                  Submit Compliance for Head Review
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 text-center text-emerald-800 font-bold">
                {req.status === 'Approved' ? '✓ Compliance package APPROVED and quarantine release stamps officially signed.' : 'Awaiting Elena Rostova audit checklist validation.'}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
