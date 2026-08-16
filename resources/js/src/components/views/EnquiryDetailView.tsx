import React from 'react';
import { Enquiry, User, DocumentRecord, DocumentVersion, DocumentWorkItemLink } from '../../types/crm';
import { Task } from '../../types/crm';

interface EnquiryDetailViewProps {
  activeEnquiry: Enquiry;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setEnquiries: React.Dispatch<React.SetStateAction<Enquiry[]>>;
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTaskId: (id: string | null) => void;
  triggerToast: (msg: string) => void;
  handleCreateTask: (taskData: Omit<Task, 'id' | 'status' | 'comments' | 'watchers' | 'creator'>) => void;
  handleCreateCostingRequest?: (enquiryId: string, salesNote: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => void;
  handlePrepareQuotationFromCosting?: (enquiryId: string, quoteId: string) => void;
  documents?: DocumentRecord[];
  documentVersions?: DocumentVersion[];
  documentWorkItemLinks?: DocumentWorkItemLink[];
  onOpenDocumentVault?: () => void;
  handleUploadDocument?: (
    title: string,
    filePath: string,
    enquiryId: string,
    workItemId?: string,
    owningDept?: string,
    sharedWith?: any,
    notes?: string
  ) => DocumentRecord;
}

export function EnquiryDetailView({
  activeEnquiry,
  activeTab,
  setActiveTab,
  currentUser,
  setEnquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTaskId,
  triggerToast,
  handleCreateTask,
  handleCreateCostingRequest,
  handlePrepareQuotationFromCosting,
  documents = [],
  documentVersions = [],
  documentWorkItemLinks = [],
  onOpenDocumentVault,
  handleUploadDocument,
}: EnquiryDetailViewProps) {
  // Sales form state for requesting costing
  const [salesNote, setSalesNote] = React.useState('');
  const [priority, setPriority] = React.useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = React.useState('2026-07-30');

  // Unified Request Form state for other departments
  const [reqTitle, setReqTitle] = React.useState('');
  const [reqDesc, setReqDesc] = React.useState('');
  const [reqPriority, setReqPriority] = React.useState('Medium');
  const [reqDueDate, setReqDueDate] = React.useState('2026-07-30');

  // Response Document upload state per task
  const [responseTaskId, setResponseTaskId] = React.useState<string | null>(null);
  const [responseDocTitle, setResponseDocTitle] = React.useState('');
  const [responseFilePath, setResponseFilePath] = React.useState('');
  const [responseNotes, setResponseNotes] = React.useState('');

  const enquiryDocs = documents.filter(d => d.enquiryId === activeEnquiry.id);

  // Dispatches a general task / request
  const handleDispatchDepartmentTask = (targetDept: string, defaultAssignee: string) => {
    if (!reqTitle.trim() || !reqDesc.trim()) {
      triggerToast('Please provide a title and description for the request.');
      return;
    }

    const generatedTaskId = `TSK-${targetDept.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;
    const newTask = {
      id: generatedTaskId,
      title: reqTitle,
      type: 'Action Item',
      assignee: defaultAssignee,
      department: targetDept,
      dueDate: reqDueDate,
      priority: reqPriority,
      status: 'Pending',
      linkedRecord: activeEnquiry.id,
      description: reqDesc,
      watchers: [currentUser.name],
      comments: []
    };

    setEnquiries(prev => prev.map(item => {
      if (item.id === activeEnquiry.id) {
        return {
          ...item,
          tasks: [...item.tasks, newTask],
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Sales dispatched task [${generatedTaskId}] to ${targetDept} Desk: "${reqTitle}".`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));

    setReqTitle('');
    setReqDesc('');
    triggerToast(`Task ${generatedTaskId} successfully dispatched to ${targetDept} Desk.`);
  };

  // Filter tasks based on the active tab context
  const getFilteredTasksForTab = (tab: string) => {
    switch (tab) {
      case 'Overview':
        return activeEnquiry.tasks.filter(t => t.department === 'Sales');
      case 'Costing':
        return activeEnquiry.tasks.filter(t => t.department === 'Costing');
      case 'Sampling':
        return activeEnquiry.tasks.filter(t => t.department === 'Sampling');
      case 'Logistics':
        return activeEnquiry.tasks.filter(t => t.department === 'Logistics');
      case 'Compliance':
        return activeEnquiry.tasks.filter(t => t.department === 'Compliance');
      case 'Contract':
        return activeEnquiry.tasks.filter(t => t.title.toLowerCase().includes('contract') || t.description.toLowerCase().includes('contract'));
      case 'PO':
        return activeEnquiry.tasks.filter(t => t.title.toLowerCase().includes('po') || t.description.toLowerCase().includes('po') || t.title.toLowerCase().includes('purchase') || t.description.toLowerCase().includes('purchase'));
      default:
        return activeEnquiry.tasks;
    }
  };

  // Renders the Department Action/Request section and related tasks list
  const renderDepartmentInteractionBox = (tab: string, deptName: string, defaultAssignee: string) => {
    const tasks = getFilteredTasksForTab(tab);

    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Dispatch request form */}
          <div className="bg-neutral-50 p-3 border border-neutral-200 text-[10px] space-y-2">
            <span className="font-bold block uppercase text-[8px] text-neutral-400">Request {deptName} Action / Costing</span>
            <div className="space-y-1.5">
              <div>
                <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Request Title</label>
                <input
                  type="text"
                  placeholder={`e.g., Secure ${deptName} details`}
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Instruction Notes</label>
                <textarea
                  placeholder={`Instruction details for ${deptName}...`}
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full bg-white border p-1 text-[10px] focus:outline-none h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Priority</label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value)}
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
                    value={reqDueDate}
                    onChange={(e) => setReqDueDate(e.target.value)}
                    className="w-full bg-white border p-1 text-[10px] focus:outline-none font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => handleDispatchDepartmentTask(deptName, defaultAssignee)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-1 text-[9px] transition-colors"
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
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {tasks.map(t => {
                  // Find documents linked to this task
                  const linkedDocLinks = documentWorkItemLinks.filter(l => l.workItemId === t.id);
                  const linkedDocIds = linkedDocLinks.map(l => l.documentId);
                  const linkedDocs = documents.filter(d => linkedDocIds.includes(d.id));

                  const isUploadingForThisTask = responseTaskId === t.id;

                  return (
                    <div key={t.id} className="p-2 border bg-neutral-50 space-y-1.5 text-[10px] hover:bg-neutral-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-neutral-900">{t.title} ({t.id})</span>
                          <span className="text-[9px] text-neutral-500">Assignee: {t.assignee} &bull; Due: {t.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setResponseTaskId(isUploadingForThisTask ? null : t.id);
                              setResponseDocTitle('');
                              setResponseFilePath('');
                              setResponseNotes('');
                            }}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-2 py-0.5 text-[8px] font-bold uppercase transition-colors"
                            title="Upload response document for this request"
                          >
                            + Attach Doc
                          </button>

                          <button
                            onClick={() => setActiveTaskId(t.id)}
                            className="bg-white border border-neutral-300 hover:bg-neutral-50 px-2 py-0.5 text-[8px] font-bold uppercase transition-colors"
                          >
                            Workspace Chat
                          </button>
                          <span className="bg-neutral-200 border px-1 py-0.5 font-mono text-[8px] uppercase font-bold">{t.status}</span>
                        </div>
                      </div>

                      {/* Display attached response documents for this request */}
                      {linkedDocs.length > 0 && (
                        <div className="bg-white border border-neutral-200 p-1.5 space-y-1 text-[9px]">
                          <span className="text-[8px] uppercase font-bold text-neutral-400 block">Response Documents Linked ({linkedDocs.length}):</span>
                          {linkedDocs.map(ld => {
                            const curVer = documentVersions.find(v => v.id === ld.currentVersionId);
                            return (
                              <div key={ld.id} className="flex justify-between items-center bg-neutral-50 p-1 border border-neutral-100 text-[8.5px]">
                                <span className="font-bold text-neutral-900">📄 {ld.title} ({curVer?.filePath || ld.id})</span>
                                <span className="font-mono text-emerald-800 bg-emerald-50 px-1 border border-emerald-200 font-bold">
                                  v{curVer?.versionNumber || 1}.0
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Upload Document inline response form */}
                      {isUploadingForThisTask && (
                        <div className="bg-white border border-neutral-300 p-2 space-y-1.5 mt-1 text-[9px]">
                          <div className="flex justify-between items-center border-b pb-1">
                            <span className="font-bold uppercase text-[8px] text-neutral-800">
                              Upload Response Document to Request [{t.id}]
                            </span>
                            <span className="text-[8px] text-neutral-400">
                              Automatically linked to Vault & Requester
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="block text-[7.5px] uppercase text-neutral-500 mb-0.5">Document Name / Title</label>
                              <input
                                type="text"
                                placeholder={`e.g. ${t.title} Deliverable`}
                                value={responseDocTitle}
                                onChange={(e) => setResponseDocTitle(e.target.value)}
                                className="w-full bg-neutral-50 border p-1 text-[9px] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[7.5px] uppercase text-neutral-500 mb-0.5">File Name / Path *</label>
                              <input
                                type="text"
                                placeholder="e.g. Lab_Report_Final_v1.pdf"
                                value={responseFilePath}
                                onChange={(e) => setResponseFilePath(e.target.value)}
                                className="w-full bg-neutral-50 border p-1 text-[9px] font-mono focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[7.5px] uppercase text-neutral-500 mb-0.5">Version Notes</label>
                            <input
                              type="text"
                              placeholder="This is what was required for this request..."
                              value={responseNotes}
                              onChange={(e) => setResponseNotes(e.target.value)}
                              className="w-full bg-neutral-50 border p-1 text-[9px] focus:outline-none"
                            />
                          </div>

                          <div className="flex justify-end space-x-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => setResponseTaskId(null)}
                              className="bg-neutral-200 text-neutral-800 text-[8px] font-bold px-2 py-0.5 uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!responseFilePath.trim()) {
                                  triggerToast('Please provide a file name.');
                                  return;
                                }
                                if (handleUploadDocument) {
                                  const title = responseDocTitle.trim() || responseFilePath.trim();
                                  handleUploadDocument(
                                    title,
                                    responseFilePath.trim(),
                                    activeEnquiry.id,
                                    t.id,
                                    t.department,
                                    undefined,
                                    responseNotes.trim() || undefined
                                  );
                                  setResponseTaskId(null);
                                  setResponseDocTitle('');
                                  setResponseFilePath('');
                                  setResponseNotes('');
                                }
                              }}
                              className="bg-neutral-950 text-white text-[8px] font-bold px-2.5 py-0.5 uppercase"
                            >
                              Upload & Link to Request
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">

      {/* Header Context Bar */}
      <div className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 rounded-none">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase">Deal Central Hub</span>
            <span className={`text-[8px] font-bold px-1.5 py-0.2 uppercase border ${
              activeEnquiry.sales_type === 'tender' ? 'bg-purple-100 text-purple-900 border-purple-300' :
              activeEnquiry.sales_type === 'distributor' ? 'bg-amber-100 text-amber-900 border-amber-300' :
              activeEnquiry.sales_type === 'retail' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
              'bg-blue-100 text-blue-900 border-blue-300'
            }`}>
              {activeEnquiry.sales_type ? activeEnquiry.sales_type.toUpperCase() : 'EXPORT'} CHANNEL
            </span>
          </div>
          <h2 className="text-xs font-bold text-neutral-950 mt-1">
            {activeEnquiry.id} &mdash; {activeEnquiry.customerName}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
          {onOpenDocumentVault && (
            <button
              onClick={onOpenDocumentVault}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 text-[9px] uppercase font-bold transition-colors flex items-center space-x-1"
            >
              <span>📄 Document Vault</span>
              <span className="bg-neutral-800 text-white px-1 text-[8px] font-mono">{enquiryDocs.length}</span>
            </button>
          )}

          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Generic Status: <strong>{activeEnquiry.status}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Discharge / Location: <strong>{activeEnquiry.destinationPort}</strong>
          </span>
          <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
            Owner: <strong>{activeEnquiry.salesOwner} ({activeEnquiry.owningDepartment || 'Sales'})</strong>
          </span>
        </div>
      </div>

      {/* Sub-Module Navigation Tabs */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5 rounded-none overflow-x-auto">
        {[
          { key: 'Overview', label: 'Sales / Overview' },
          { key: 'Costing', label: 'Costing' },
          { key: 'Sampling', label: 'Sampling' },
          { key: 'Logistics', label: 'Logistics' },
          { key: 'Compliance', label: 'Compliance' },
          { key: 'Contract', label: 'Contract' },
          { key: 'PO', label: 'PO' },
          { key: 'Tasks', label: 'Tasks / Activity' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase shrink-0 rounded-none transition-colors ${
              activeTab === tab.key
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Viewport for Active Tab */}
      <div className="bg-white border border-neutral-200 p-4 rounded-none">

        {/* 1. OVERVIEW & TIMELINE */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-3 border border-neutral-200 p-3 bg-neutral-50 text-[10px]">
                  <div>
                    <span className="text-neutral-400 block text-[8px] uppercase font-bold">Cargo Description</span>
                    <span className="font-bold text-neutral-900">{activeEnquiry.product}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[8px] uppercase font-bold">Shipment Volume</span>
                    <span className="font-bold text-neutral-900">{activeEnquiry.quantity}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[8px] uppercase font-bold">Corporate Buyer / Agency</span>
                    <span className="font-bold text-neutral-900">{activeEnquiry.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[8px] uppercase font-bold">Discharge / Delivery Location</span>
                    <span className="font-bold text-neutral-900">{activeEnquiry.destinationPort}</span>
                  </div>
                </div>

                {/* CHANNEL-SPECIFIC BRANCH SPECIFICATIONS */}
                <div className="border border-neutral-200 p-3 bg-neutral-50/50 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="font-bold uppercase text-[9px] tracking-wider text-neutral-700">
                      Channel-Specific Specifications & Stage
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-neutral-200 text-neutral-700 px-1.5 py-0.2">
                      {activeEnquiry.sales_type || 'export'}
                    </span>
                  </div>

                  {activeEnquiry.sales_type === 'tender' && activeEnquiry.tenderDetails && (
                    <div className="grid grid-cols-3 gap-2 bg-purple-50/60 p-2.5 border border-purple-200">
                      <div>
                        <span className="text-purple-600 block text-[8px] uppercase font-bold">Tender Portal Source</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.tenderDetails.portalSource}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[8px] uppercase font-bold">Tender Number</span>
                        <span className="font-bold font-mono text-neutral-900">{activeEnquiry.tenderDetails.tenderNumber}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[8px] uppercase font-bold">Government Agency</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.tenderDetails.governmentAgencyName}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[8px] uppercase font-bold">EMD Deposit Amount</span>
                        <span className="font-bold font-mono text-neutral-900">₹{activeEnquiry.tenderDetails.emdAmount.toLocaleString()} ({activeEnquiry.tenderDetails.emdStatus})</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[8px] uppercase font-bold">Submission Deadline</span>
                        <span className="font-bold font-mono text-neutral-900">{activeEnquiry.tenderDetails.submissionDeadline}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[8px] uppercase font-bold">Tender Stage Pipeline</span>
                        <span className="font-bold uppercase text-purple-900 bg-purple-100 border border-purple-200 px-1 text-[8px]">{activeEnquiry.tenderDetails.tenderStage}</span>
                      </div>
                    </div>
                  )}

                  {activeEnquiry.sales_type === 'distributor' && activeEnquiry.distributorDetails && (
                    <div className="grid grid-cols-3 gap-2 bg-amber-50/60 p-2.5 border border-amber-200">
                      <div>
                        <span className="text-amber-700 block text-[8px] uppercase font-bold">Distributor Name</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.distributorDetails.distributorName}</span>
                      </div>
                      <div>
                        <span className="text-amber-700 block text-[8px] uppercase font-bold">Allocated Territory</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.distributorDetails.territory}</span>
                      </div>
                      <div>
                        <span className="text-amber-700 block text-[8px] uppercase font-bold">Distributor Stage</span>
                        <span className="font-bold uppercase text-amber-900 bg-amber-100 border border-amber-200 px-1 text-[8px]">{activeEnquiry.distributorDetails.distributorStage}</span>
                      </div>
                    </div>
                  )}

                  {activeEnquiry.sales_type === 'retail' && activeEnquiry.retailDetails && (
                    <div className="grid grid-cols-3 gap-2 bg-emerald-50/60 p-2.5 border border-emerald-200">
                      <div>
                        <span className="text-emerald-700 block text-[8px] uppercase font-bold">Retail Channel</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.retailDetails.retailChannel}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[8px] uppercase font-bold">End Customer Scope</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.retailDetails.endCustomerInfo}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[8px] uppercase font-bold">Retail Stage</span>
                        <span className="font-bold uppercase text-emerald-900 bg-emerald-100 border border-emerald-200 px-1 text-[8px]">{activeEnquiry.retailDetails.retailStage}</span>
                      </div>
                    </div>
                  )}

                  {(!activeEnquiry.sales_type || activeEnquiry.sales_type === 'export') && (
                    <div className="grid grid-cols-3 gap-2 bg-blue-50/60 p-2.5 border border-blue-200">
                      <div>
                        <span className="text-blue-700 block text-[8px] uppercase font-bold">Destination Country</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.exportDetails?.destinationCountry || activeEnquiry.destinationPort}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block text-[8px] uppercase font-bold">Incoterms</span>
                        <span className="font-bold font-mono text-neutral-900">{activeEnquiry.exportDetails?.incoterms || 'CIF Hamburg'}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block text-[8px] uppercase font-bold">Export Stage Pipeline</span>
                        <span className="font-bold uppercase text-blue-900 bg-blue-100 border border-blue-200 px-1 text-[8px]">{activeEnquiry.exportDetails?.exportStage || 'costing'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quotations sub-grid inside Overview to enable preparing/viewing quotes */}
                <div className="border border-neutral-200 p-3 bg-white space-y-3">
                  <span className="font-bold text-[9px] uppercase text-neutral-400 block">Active Quotation Proposal</span>
                  {activeEnquiry.quotations.map(q => (
                    <div key={q.id} className="border border-neutral-100 bg-neutral-50 p-2 text-[10px] space-y-2">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-bold">Proposal Reference: {q.id} ({q.version})</span>
                        <span className="font-bold uppercase text-[8px] bg-white border px-1.5 py-0.2">{q.stage}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 bg-white p-2 border">
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase">Base Procurement</span>
                          <span className="font-bold text-neutral-900">{q.pricing.baseCost}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase">Logistics Factors</span>
                          <span className="font-bold text-neutral-900">{q.pricing.logistics}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase">Margin Allocation</span>
                          <span className="font-bold text-neutral-900">{q.pricing.margin}</span>
                        </div>
                        <div>
                          <span className="text-neutral-900 block font-bold text-[8px] uppercase">Total Quotation</span>
                          <span className="font-bold text-neutral-950 font-mono">{q.pricing.finalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Log Feed */}
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-none">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-wider block mb-2">Chronological Activity Log</span>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {activeEnquiry.timeline.slice().reverse().map(log => (
                    <div key={log.id} className="text-[9px] leading-relaxed border-b border-neutral-200 pb-1.5">
                      <p className="text-neutral-900 font-medium">{log.text}</p>
                      <span className="text-[8px] text-neutral-400 block mt-0.5">Author: {log.user} &bull; {log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {renderDepartmentInteractionBox('Overview', 'Sales', 'Rajesh Mehta')}
          </div>
        )}

        {/* 2. COSTING SECTION (Inside Enquiry) */}
        {activeTab === 'Costing' && (
          <div className="space-y-4 text-[10px]">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-neutral-950 uppercase text-xs">Costing Desk Collaboration Portal</h3>
                <p className="text-neutral-500 text-[9px]">Sales workspace to dispatch background cost requests and trace estimation results.</p>
              </div>
              {activeEnquiry.costingRequest && (
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] text-neutral-500">Status:</span>
                  <span className={`px-2 py-0.5 font-bold uppercase text-[8px] border ${
                    activeEnquiry.costingRequest.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    activeEnquiry.costingRequest.status === 'Ready for Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {activeEnquiry.costingRequest.status}
                  </span>
                </div>
              )}
            </div>

            {!activeEnquiry.costingRequest ? (
              <div className="p-4 border border-dashed border-neutral-200 bg-neutral-50 text-center space-y-3">
                <p className="text-neutral-500">No active costing calculation is registered for this Enquiry.</p>

                <div className="max-w-md mx-auto bg-white p-3 border text-left space-y-3">
                  <span className="font-bold block uppercase text-[8px] text-neutral-400">Initiate New Costing Request</span>

                  <div>
                    <label className="block text-[8px] uppercase text-neutral-500 mb-1">Instruction / Specifications</label>
                    <textarea
                      placeholder="e.g., Need costing for 50 MT premium sesame seeds to Hamburg."
                      value={salesNote}
                      onChange={(e) => setSalesNote(e.target.value)}
                      className="w-full bg-white border p-1 text-[10px] focus:outline-none h-16"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] uppercase text-neutral-500 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-white border p-1 text-[10px] focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase text-neutral-500 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-white border p-1 text-[10px] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!salesNote.trim()) {
                        triggerToast('Please provide specification details for costing.');
                        return;
                      }
                      if (handleCreateCostingRequest) {
                        handleCreateCostingRequest(activeEnquiry.id, salesNote, priority, dueDate);
                        setSalesNote('');
                      } else {
                        triggerToast('Costing handler not linked.');
                      }
                    }}
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase py-1.5 text-[9px]"
                  >
                    Dispatch Costing Request to Operations
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Status and Summary Cards */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border p-3 bg-neutral-50 space-y-2">
                    <span className="font-bold text-[9px] uppercase text-neutral-400 block">Calculation Scope Detail</span>
                    <p>Specification Target: <strong className="text-neutral-900">{activeEnquiry.costingRequest.salesNote}</strong></p>
                    <div className="grid grid-cols-3 gap-2 bg-white p-2 border text-[9px]">
                      <div>
                        <span className="text-neutral-400 block uppercase text-[8px]">Assigned Analyst</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.costingRequest.assignee || 'Awaiting assignment'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase text-[8px]">Priority</span>
                        <span className="font-bold text-neutral-900">{activeEnquiry.costingRequest.priority}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase text-[8px]">Target Target SLA</span>
                        <span className="font-bold text-neutral-900 font-mono">{activeEnquiry.costingRequest.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pending / In-progress factors */}
                  <div className="border p-3 space-y-2">
                    <span className="font-bold text-[9px] uppercase text-neutral-400 block">Costing Compilation Progress</span>
                    {activeEnquiry.costingRequest.components.length === 0 ? (
                      <p className="text-neutral-500 italic">No cost factors have been recorded by the costing department yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {activeEnquiry.costingRequest.components.map(comp => (
                          <div key={comp.id} className="flex justify-between items-center py-1 border-b border-neutral-100">
                            <div>
                              <span className="font-medium text-neutral-900">{comp.name}</span>
                              {comp.notes && <span className="text-neutral-400 text-[8px] block">{comp.notes}</span>}
                            </div>
                            <span className="font-mono font-bold text-neutral-950">${comp.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Final Approved Costing Sheet */}
                  {activeEnquiry.costingRequest.approvedCosting ? (
                    <div className="border-2 border-neutral-950 p-3 bg-neutral-50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[9px] uppercase text-emerald-700">✓ Final Approved Costing Model</span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 border border-emerald-200 text-[8px] font-bold">APPROVED</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 bg-white p-2 border">
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase">Base cost (FOB)</span>
                          <span className="font-bold font-mono">${activeEnquiry.costingRequest.approvedCosting.baseCost.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase">Logistics Factors</span>
                          <span className="font-bold font-mono">${activeEnquiry.costingRequest.approvedCosting.logistics.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase">Corporate Margin</span>
                          <span className="font-bold font-mono">${activeEnquiry.costingRequest.approvedCosting.margin.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-emerald-700 block text-[8px] uppercase font-bold">Total price index</span>
                          <span className="font-bold font-mono text-emerald-700">${activeEnquiry.costingRequest.approvedCosting.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Button to Prepare Customer Quotation */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            if (handlePrepareQuotationFromCosting && activeEnquiry.quotations[0]) {
                              handlePrepareQuotationFromCosting(activeEnquiry.id, activeEnquiry.quotations[0].id);
                            } else {
                              triggerToast('Quotation generator is not accessible.');
                            }
                          }}
                          className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1.5 text-[9px]"
                        >
                          Prepare Customer Quotation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed p-3 text-center text-neutral-400">
                      Awaiting managerial validation and sign-off on the compiled pricing figures.
                    </div>
                  )}
                </div>

                {/* Sub-communication log, notes, and documents */}
                <div className="space-y-4">
                  <div className="border p-3 bg-neutral-50 space-y-2">
                    <span className="font-bold text-[9px] uppercase text-neutral-400 block">Costing Documents ({activeEnquiry.costingRequest.documents.length})</span>
                    {activeEnquiry.costingRequest.documents.length === 0 ? (
                      <p className="text-neutral-400 italic text-[9px]">No spreadsheets attached yet.</p>
                    ) : (
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {activeEnquiry.costingRequest.documents.map(doc => (
                          <div key={doc.id} className="text-[9px] py-1 border-b flex justify-between items-center bg-white px-2 border">
                            <span className="text-neutral-900 font-medium truncate w-32">{doc.fileName}</span>
                            <span className="text-neutral-400 text-[8px]">{doc.uploadedBy}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border p-3 bg-neutral-50 space-y-2">
                    <span className="font-bold text-[9px] uppercase text-neutral-400 block">Remarks / Revision History ({activeEnquiry.costingRequest.comments.length})</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {activeEnquiry.costingRequest.comments.map(c => (
                        <div key={c.id} className="bg-white p-2 border text-[9px] space-y-1">
                          <p className="text-neutral-800">{c.text}</p>
                          <span className="text-[8px] text-neutral-400 block">From: {c.author} &bull; {c.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
            {renderDepartmentInteractionBox('Costing', 'Costing', 'Sarah Jenkins')}
          </div>
        )}

        {/* 3. SAMPLING */}
        {activeTab === 'Sampling' && (
          <div className="space-y-4">
            <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="font-bold">WAYBILL: {activeEnquiry.sampling.id}</span>
                <span className="bg-white border px-2 py-0.5 text-[8px] font-bold uppercase">{activeEnquiry.sampling.stage}</span>
              </div>
              <p>Carrier Assigned: <strong>{activeEnquiry.sampling.carrier}</strong></p>
              <p>Air Waybill Number: <span className="font-mono">{activeEnquiry.sampling.trackingNumber}</span></p>
              <p>Lab Notes: <span className="text-neutral-500">{activeEnquiry.sampling.notes}</span></p>
            </div>
            {renderDepartmentInteractionBox('Sampling', 'Sampling', 'Liam Carter')}
          </div>
        )}

        {/* 4. LOGISTICS */}
        {activeTab === 'Logistics' && (
          <div className="space-y-4">
            <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
              <span className="font-bold block uppercase text-[9px] tracking-tight text-neutral-400">Maritime Freight Slot locks</span>
              <p>Freight Operator: <strong>Chloe Taylor (Logistics Desk)</strong></p>
              {activeEnquiry.purchaseOrder ? (
                <div className="bg-white p-2 border space-y-1 mt-1">
                  <p>Allocated vessel: <strong>{activeEnquiry.purchaseOrder.carrier || 'Not assigned yet'}</strong></p>
                  <p>Status: <span className="font-mono">{activeEnquiry.purchaseOrder.stage}</span></p>
                </div>
              ) : (
                <p className="text-neutral-400 italic">No purchase order container slot locked yet.</p>
              )}
            </div>
            {renderDepartmentInteractionBox('Logistics', 'Logistics', 'Chloe Taylor')}
          </div>
        )}

        {/* 5. COMPLIANCE */}
        {activeTab === 'Compliance' && (
          <div className="space-y-4">
            <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
              <p>Assigned Sourcing Cooperative: <strong>{activeEnquiry.vendorApproval.vendorName}</strong></p>
              <p>Agronomic field safety rating: <span className="font-bold">{activeEnquiry.vendorApproval.score}</span></p>
              <p>Quarantine assessment status: <span className="font-mono">{activeEnquiry.vendorApproval.complianceCheck}</span></p>
            </div>
            {renderDepartmentInteractionBox('Compliance', 'Compliance', 'Sophia Miller')}
          </div>
        )}

        {/* 6. CONTRACT */}
        {activeTab === 'Contract' && (
          <div className="space-y-4">
            <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
              <p>File Target: <span className="font-mono">{activeEnquiry.contract.file} ({activeEnquiry.contract.version})</span></p>
              <p>Signatures Status: <strong>{activeEnquiry.contract.signatureStatus}</strong></p>
            </div>
            {renderDepartmentInteractionBox('Contract', 'Contracts', 'Amanda Vance')}
          </div>
        )}

        {/* 7. PO */}
        {activeTab === 'PO' && (
          <div className="space-y-4">
            <div className="text-[10px]">
              {!activeEnquiry.purchaseOrder ? (
                <div className="text-center py-4 border border-dashed border-neutral-200 text-neutral-400">
                  No active purchase order linked yet. (Triggers when quote moves to WON stage).
                </div>
              ) : (
                <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="font-bold text-neutral-900">PO RECORD: {activeEnquiry.purchaseOrder.id}</span>
                    <span className="bg-neutral-950 text-white px-2 py-0.5 text-[8px] uppercase">{activeEnquiry.purchaseOrder.stage}</span>
                  </div>
                  <p>Total Financial Value: <span className="font-bold font-mono">{activeEnquiry.purchaseOrder.totalValue}</span></p>
                  <p>Containers count: <span className="font-mono">{activeEnquiry.purchaseOrder.shippingContainerCount}</span></p>
                  <p>Loading Target Date: <span className="font-mono">{activeEnquiry.purchaseOrder.loadingDate}</span></p>
                </div>
              )}
            </div>
            {renderDepartmentInteractionBox('PO', 'Sales', 'Rajesh Mehta')}
          </div>
        )}

        {/* 8. TASKS & INTERNAL COLLABORATION (TASK DELEGATION BOX & CHAT TRIGGER) */}
        {activeTab === 'Tasks' && (
          <div className="space-y-3">
            <span className="font-bold block uppercase text-[9px] tracking-tight text-neutral-400">Delegate Background Checks to Departments</span>
            <div className="p-3 border bg-neutral-50 text-[10px]">
              <p className="text-neutral-500 mb-2">Sales owners can dispatch background duties and collaborate on them using internal chat channels.</p>
              <button
                onClick={() => {
                  const generatedTaskId = `TSK-${Math.floor(Math.random() * 900) + 100}`;
                  const newTask: any = {
                    id: generatedTaskId,
                    title: 'Perform Phytosanitary Safety Evaluation',
                    type: 'Action Item',
                    assignee: 'Sophia Miller',
                    department: 'Compliance',
                    dueDate: '2026-07-28',
                    priority: 'High',
                    status: 'Pending',
                    linkedRecord: activeEnquiry.id,
                    parentEnquiryId: activeEnquiry.id,
                    description: 'Moisture target checks on physical raw cargo samples before logistics release.',
                    watchers: ['Sophia Miller'],
                    comments: []
                  };

                  setEnquiries(prev => prev.map(item => {
                    if (item.id === activeEnquiry.id) {
                      return {
                        ...item,
                        tasks: [...item.tasks, newTask],
                        timeline: [
                          ...item.timeline,
                          {
                            id: Date.now(),
                            text: `Sales assigned task [${generatedTaskId}] to Compliance Desk.`,
                            user: currentUser.name,
                            date: 'Just now'
                          }
                        ]
                      };
                    }
                    return item;
                  }));

                  // We can pass a prop or directly use setEnquiries since it modifies the active state?
                  // Wait, let's add `handleCreateTask` to the EnquiryDetailView props, or support a callback.
                  // Let's pass `handleCreateTask` into EnquiryDetailView!
                  handleCreateTask({
                    title: 'Perform Phytosanitary Safety Evaluation',
                    type: 'Action Item',
                    assignee: 'Sophia Miller',
                    department: 'Compliance',
                    dueDate: '2026-07-28',
                    priority: 'High',
                    linkedRecord: activeEnquiry.id,
                    parentEnquiryId: activeEnquiry.id,
                    description: 'Moisture target checks on physical raw cargo samples before logistics release.'
                  });                }}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1 text-[9px] rounded-none transition-colors"
              >
                + Delegate Sample Compliance Check (Compliance Desk)
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-[8px] uppercase text-neutral-400">Current Deal Task Status Stack (Click on any task to open its Chat Workspace)</span>
              {activeEnquiry.tasks.map(t => (
                <div key={t.id} className="p-2 border bg-neutral-50 flex justify-between items-center text-[10px] hover:bg-neutral-100 transition-colors">
                  <div className="cursor-pointer" onClick={() => setActiveTaskId(t.id)}>
                    <span className="font-bold block text-neutral-900 hover:underline">{t.title} ({t.id})</span>
                    <span className="text-[9px] text-neutral-500">Assignee: {t.assignee} ({t.department}) &bull; Due: {t.dueDate} &bull; Watchers: {t.watchers ? t.watchers.join(', ') : 'None'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTaskId(t.id)}
                      className="bg-white border border-neutral-300 hover:bg-neutral-50 px-2 py-0.5 text-[8px] font-bold uppercase"
                    >
                      Workspace Chat ({t.comments ? t.comments.length : 0})
                    </button>
                    <span className="bg-neutral-200 border px-1.5 py-0.5 font-mono text-[8px] uppercase font-bold">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
