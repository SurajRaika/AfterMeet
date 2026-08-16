import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table as TableIcon,
  Grid as KanbanIcon,
  Plus,
  Trash2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Eye as ViewIcon
} from 'lucide-react';
import { Prospect, Campaign, CustomView, CustomViewCondition, CustomFieldDefinition } from '../../types/crm';
import { apiClient } from '../../services/apiClient';

interface SalesProspectsViewProps {
  prospects: Prospect[];
  setProspects: React.Dispatch<React.SetStateAction<Prospect[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  aiGeneratingId: string | null;
  handleGenerateAIOutreach: (prospectId: string) => Promise<void>;
  promoteProspectToEnquiry: (prospectId: string) => void;
  triggerToast: (msg: string) => void;

  customViews: CustomView[];
  activeCustomViewId: string | null;
  setActiveCustomViewId: (id: string | null) => void;
  prospectDisplayMode: 'table' | 'kanban';
  setProspectDisplayMode: (mode: 'table' | 'kanban') => void;
  handleUpdateProspectStatus: (prospectId: string, status: string) => Promise<void>;
  handleCreateCustomView: (name: string, conditions: CustomViewCondition[]) => Promise<void>;
  handleDeleteCustomView: (id: string) => Promise<void>;
}

export function SalesProspectsView({
  prospects,
  setProspects,
  campaigns,
  setCampaigns,
  selectedTone,
  setSelectedTone,
  aiGeneratingId,
  handleGenerateAIOutreach,
  promoteProspectToEnquiry,
  triggerToast,

  customViews,
  activeCustomViewId,
  setActiveCustomViewId,
  prospectDisplayMode,
  setProspectDisplayMode,
  handleUpdateProspectStatus,
  handleCreateCustomView,
  handleDeleteCustomView,
}: SalesProspectsViewProps) {
  // Local UI States
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Custom View Builder states
  const [showBuilder, setShowBuilder] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [conditions, setConditions] = useState<CustomViewCondition[]>([
    { field: 'sentiment', operator: 'equals', value: 'Warm Lead' }
  ]);

  // Create Prospect Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [newVolume, setNewVolume] = useState('10 Metric Tons');
  const [newSentiment, setNewSentiment] = useState('Discovered');
  const [newStatus, setNewStatus] = useState('Cold outreach');

  // Options for custom views builder
  const prospectFields: { value: keyof Prospect; label: string }[] = [
    { value: 'companyName', label: 'Company Name' },
    { value: 'contactName', label: 'Contact Name' },
    { value: 'cropInterest', label: 'Crop Interest' },
    { value: 'status', label: 'Status' },
    { value: 'sentiment', label: 'Sentiment' },
    { value: 'lastOutboundCampaign', label: 'Campaign' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_equals', label: 'Does Not Equal' }
  ] as const;

  const sentimentOptions = ['Discovered', 'Unreplied', 'Positive Interest', 'Warm Lead', 'Cold outreach'];
  const statusOptions = ['Cold outreach', 'Engaged', 'Negotiation Draft', 'Enquiry Active'];

  // Handle building view
  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'sentiment', operator: 'equals', value: 'Warm Lead' }]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: keyof CustomViewCondition, value: any) => {
    setConditions(prev => prev.map((cond, i) => {
      if (i === index) {
        return { ...cond, [field]: value };
      }
      return cond;
    }));
  };

  const handleSaveView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) {
      triggerToast('Please provide a name for your custom view.');
      return;
    }
    await handleCreateCustomView(newViewName, conditions);
    setNewViewName('');
    setConditions([{ field: 'sentiment', operator: 'equals', value: 'Warm Lead' }]);
    setShowBuilder(false);
  };

  // Filter prospects dynamically based on active Custom View conditions and text search
  const filteredProspects = useMemo(() => {
    let list = prospects;

    // 1. Apply Active Custom View Conditions
    if (activeCustomViewId) {
      const activeView = customViews.find(v => v.id === activeCustomViewId);
      if (activeView) {
        list = list.filter(p => {
          return activeView.conditions.every(cond => {
            const fieldValue = String(p[cond.field] || '').toLowerCase();
            const targetValue = cond.value.toLowerCase();
            if (cond.operator === 'equals') {
              return fieldValue === targetValue;
            }
            if (cond.operator === 'contains') {
              return fieldValue.includes(targetValue);
            }
            if (cond.operator === 'not_equals') {
              return fieldValue !== targetValue;
            }
            return true;
          });
        });
      }
    }

    // 2. Apply Text Search
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.cropInterest.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.sentiment.toLowerCase().includes(q)
      );
    }

    return list;
  }, [prospects, activeCustomViewId, customViews, tableSearchQuery]);

  // React Table Columns setup
  const columns = useMemo<ColumnDef<Prospect>[]>(() => [
    {
      accessorKey: 'id',
      header: 'Lead ID',
      cell: info => <span className="font-mono font-bold text-neutral-900">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'companyName',
      header: 'Company & Contact',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-bold text-neutral-950">{row.companyName}</span>
            <span className="block text-neutral-500 text-[9px]">{row.contactName} ({row.email})</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'cropInterest',
      header: 'Crop Interest',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-medium">{row.cropInterest}</span>
            <span className="block text-neutral-400 text-[9px]">Volume: {row.estimatedVolume}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'lastOutboundCampaign',
      header: 'Outbound Campaign',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block">{row.lastOutboundCampaign || 'No campaign assigned'}</span>
            <span className="block text-[9px] text-neutral-400">Emails dispatched: {row.emailsSent}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
      cell: info => {
        const val = info.getValue() as string;
        const color = val === 'Positive Interest' || val === 'Warm Lead' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-neutral-600 bg-neutral-100 border-neutral-200';
        return <span className={`inline-block px-1 py-0.2 text-[8px] font-bold border uppercase ${color}`}>{val}</span>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue() as string;
        const replyReceived = info.row.original.replyReceived;
        return (
          <div>
            <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold border uppercase ${
              status === 'Enquiry Active'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : replyReceived
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}>{status}</span>
            {replyReceived && status !== 'Enquiry Active' && (
              <span className="block text-[8px] text-emerald-600 font-bold mt-0.5">✔ Active Reply</span>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: info => {
        const p = info.row.original;
        return (
          <div className="flex flex-col gap-1 items-end">
            {p.status !== 'Enquiry Active' ? (
              <>
                <button
                  onClick={() => handleGenerateAIOutreach(p.id)}
                  disabled={aiGeneratingId === p.id}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white text-[9px] px-2 py-0.5 rounded-none uppercase block w-28 text-center"
                >
                  {aiGeneratingId === p.id ? 'Generating...' : 'Gen AI Outreach'}
                </button>
                {p.replyReceived && (
                  <button
                    onClick={() => promoteProspectToEnquiry(p.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] px-2 py-0.5 rounded-none uppercase block w-28 text-center font-bold"
                  >
                    Convert to Enquiry →
                  </button>
                )}
              </>
            ) : (
              <span className="text-[9px] text-emerald-600 block italic font-bold">Deal Promoted</span>
            )}
          </div>
        );
      }
    }
  ], [aiGeneratingId, handleGenerateAIOutreach, promoteProspectToEnquiry]);

  // Tanstack React Table initialization
  const table = useReactTable({
    data: filteredProspects,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      }
    }
  });

  // Kanban HTML5 Drag-and-Drop state handlers
  const handleDragStart = (e: React.DragEvent, prospectId: string) => {
    e.dataTransfer.setData('text/plain', prospectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    await handleUpdateProspectStatus(id, targetStatus);
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Header & Switcher */}
      <div className="border-b border-neutral-200 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Outbound Marketing Prospects Pipeline</h1>
          <p className="text-neutral-500 text-[10px]">Cold Outreach, Automated Email sequences, and LLM Powered Campaign Sourcing before active communication is promoted to Enquiries.</p>
        </div>

        {/* View switcher and New Prospect Button */}
        <div className="flex items-center space-x-2 shrink-0 self-end">
          <div className="bg-neutral-100 p-0.5 flex space-x-0.5 border border-neutral-200">
            <button
              onClick={() => setProspectDisplayMode('table')}
              className={`p-1 flex items-center space-x-1 text-[9px] uppercase font-bold ${
                prospectDisplayMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setProspectDisplayMode('kanban')}
              className={`p-1 flex items-center space-x-1 text-[9px] uppercase font-bold ${
                prospectDisplayMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
              }`}
              title="Kanban Board"
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewCompany('');
              setNewContact('');
              setNewEmail('');
              setNewCrop('');
              setNewVolume('10 Metric Tons');
              setNewSentiment('Discovered');
              setNewStatus('Cold outreach');
              setShowCreateModal(true);
            }}
            className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-2.5 rounded-none text-[10px] uppercase flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* CUSTOM VIEW TAB SWITCHER */}
      <div className="bg-white border p-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-neutral-400 font-bold uppercase mr-2 tracking-wider">Active View:</span>
          <button
            onClick={() => setActiveCustomViewId(null)}
            className={`px-2.5 py-1 font-bold border transition-all ${
              activeCustomViewId === null
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            All Prospects ({prospects.length})
          </button>

          {/* Render User & Built-In Custom Views */}
          {customViews.map(view => {
            const isActive = activeCustomViewId === view.id;
            return (
              <div key={view.id} className="flex items-center">
                <button
                  onClick={() => setActiveCustomViewId(view.id)}
                  className={`px-2.5 py-1 font-bold border-l border-t border-b transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                  }`}
                >
                  {view.name}
                </button>
                {!view.isBuiltIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustomView(view.id);
                    }}
                    className="px-1.5 py-1 bg-red-50 text-red-600 border hover:bg-red-100 border-neutral-200 transition-all font-bold"
                    title="Delete custom view"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="text-neutral-900 underline hover:no-underline font-bold uppercase flex items-center space-x-1"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showBuilder ? 'Close View Builder' : 'Create Custom View'}</span>
        </button>
      </div>

      {/* CUSTOM VIEW BUILDER POPULAR */}
      {showBuilder && (
        <form onSubmit={handleSaveView} className="bg-neutral-50 border p-3.5 space-y-3 text-[10px]">
          <div className="border-b pb-1">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400">Custom View Creator</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-neutral-500">View Name</label>
              <input
                type="text"
                placeholder="e.g. Cardamom Leads, High Volume"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="w-full bg-white border border-neutral-200 p-1.5 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Conditions Rows */}
          <div className="space-y-2">
            <span className="font-bold uppercase text-neutral-500 block">Match all of the following rules:</span>
            {conditions.map((cond, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 bg-white p-2 border border-neutral-100">
                <select
                  value={cond.field}
                  onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                >
                  {prospectFields.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={cond.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                {/* Render values dynamically if status or sentiment */}
                {cond.field === 'sentiment' ? (
                  <select
                    value={cond.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                  >
                    {sentimentOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : cond.field === 'status' ? (
                  <select
                    value={cond.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Value..."
                    value={cond.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 p-1 focus:outline-none"
                    required
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveCondition(index)}
                  className="text-red-500 hover:text-red-700 font-bold ml-auto"
                  disabled={conditions.length === 1}
                >
                  Remove Rule
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleAddCondition}
              className="text-neutral-900 border border-neutral-300 hover:bg-neutral-100 py-1 px-2.5 font-bold uppercase"
            >
              + Add Condition Rule
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-3 uppercase"
            >
              Save Custom View
            </button>
          </div>
        </form>
      )}

      {/* Marketing Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Current View Count</span>
          <p className="text-base font-black text-neutral-900 mt-1">{filteredProspects.length} Matching Leads</p>
          <span className="text-neutral-500 text-[9px]">Out of {prospects.length} total in pipeline</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active Outbound Sequences</span>
          <p className="text-base font-black text-neutral-900 mt-1">{campaigns.filter(c => c.active).length} Sequences Active</p>
          <span className="text-emerald-600 text-[9px] font-bold">● High Deliverability</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Conversion Rate</span>
          <p className="text-base font-black text-neutral-900 mt-1">
            {filteredProspects.length > 0 ? Math.round((filteredProspects.filter(p => p.replyReceived).length / filteredProspects.length) * 100) : 0}% Conversion
          </p>
          <span className="text-neutral-500 text-[9px]">Based on filtered subset</span>
        </div>
        <div className="bg-white border p-3 font-mono">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active AI Outreach Service</span>
          <p className="text-base font-black text-emerald-600 mt-1">ONLINE</p>
          <span className="text-neutral-500 text-[9px]">gemini-3-flash-preview ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main interactive area based on selected mode */}
        <div className="xl:col-span-2 space-y-3">
          {prospectDisplayMode === 'table' ? (
            <div className="bg-white border border-neutral-200 p-3 rounded-none space-y-3">
              {/* Table search, view options and visibility toggles */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-neutral-100">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-neutral-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search in these prospects..."
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 pl-8 pr-2 py-1 text-[10px] focus:outline-none"
                  />
                </div>

                {/* Column visibility dropdown toggle */}
                <div className="relative self-end">
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="border border-neutral-200 hover:bg-neutral-50 px-2 py-1 flex items-center space-x-1 font-bold text-[9px] uppercase"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Columns Visibility</span>
                  </button>

                  {showColumnDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-neutral-200 p-2 z-15 shadow-sm space-y-1 min-w-[150px] text-[9px]">
                      <div className="font-bold border-b pb-1 text-neutral-400 uppercase">Toggle Columns</div>
                      {table.getAllLeafColumns().map(column => (
                        <label key={column.id} className="flex items-center space-x-2 py-0.5 hover:bg-neutral-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                            className="rounded-none accent-black"
                          />
                          <span className="capitalize">{column.id}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tanstack Table rendering */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                        {headerGroup.headers.map(header => {
                          const isSortable = header.column.getCanSort();
                          return (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              className={`p-2 select-none ${isSortable ? 'cursor-pointer hover:text-black' : ''}`}
                            >
                              <div className="flex items-center space-x-1">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-3 h-3" />}
                                {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-3 h-3" />}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="p-2 align-middle">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="p-8 text-center text-neutral-400 uppercase">
                          No prospects found matching current criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-[9px] uppercase font-bold text-neutral-500">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className="bg-neutral-50 border border-neutral-200 p-1 focus:outline-none"
                  >
                    {[5, 10, 20].map(size => (
                      <option key={size} value={size}>{size} leads</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</span>
                  <div className="flex space-x-0.5">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="border border-neutral-200 hover:bg-neutral-50 px-2 py-1 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="border border-neutral-200 hover:bg-neutral-50 px-2 py-1 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* INTERACTIVE KANBAN BOARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {statusOptions.map(colStatus => {
                const columnLeads = filteredProspects.filter(p => p.status === colStatus);
                return (
                  <div
                    key={colStatus}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnColumn(e, colStatus)}
                    className="bg-neutral-50 border border-neutral-200 p-2.5 min-h-[450px] flex flex-col space-y-2"
                  >
                    {/* Column Header */}
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-1.5 mb-1 text-[10px]">
                      <span className="font-bold text-neutral-900 uppercase tracking-wide">{colStatus}</span>
                      <span className="bg-neutral-200 text-neutral-700 px-1.5 py-0.2 font-mono font-bold text-[8px]">
                        {columnLeads.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {columnLeads.length > 0 ? (
                        columnLeads.map(lead => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            className="bg-white border border-neutral-200 p-2.5 cursor-grab active:cursor-grabbing hover:border-black transition-all space-y-1.5 shadow-2xs relative group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono font-bold text-neutral-400 text-[8px]">{lead.id}</span>
                              <span className={`inline-block px-1 py-0.2 text-[7px] font-bold border uppercase ${
                                lead.sentiment === 'Positive Interest' || lead.sentiment === 'Warm Lead'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-neutral-100 text-neutral-600 border-neutral-100'
                              }`}>{lead.sentiment}</span>
                            </div>

                            <div>
                              <strong className="block text-neutral-900 text-[11px] leading-tight font-black">{lead.companyName}</strong>
                              <span className="text-neutral-500 text-[9px] block">{lead.contactName}</span>
                            </div>

                            <div className="text-[9px] border-t border-neutral-100 pt-1.5 space-y-0.5">
                              <span className="block text-neutral-700">🌱 Interest: <span className="font-bold">{lead.cropInterest}</span></span>
                              <span className="block text-neutral-400">⚖ Vol: {lead.estimatedVolume}</span>
                            </div>

                            {/* Dropdown status update fallback buttons inside the card */}
                            <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100">
                              <select
                                value={lead.status}
                                onChange={async (e) => await handleUpdateProspectStatus(lead.id, e.target.value)}
                                className="bg-neutral-50 border border-neutral-200 text-[8px] px-1 py-0.5 focus:outline-none"
                              >
                                {statusOptions.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>

                              {lead.status !== 'Enquiry Active' && (
                                <button
                                  onClick={() => handleGenerateAIOutreach(lead.id)}
                                  disabled={aiGeneratingId === lead.id}
                                  className="ml-auto bg-neutral-950 text-white text-[7px] font-bold px-1.5 py-0.5 uppercase flex items-center space-x-0.5"
                                  title="Gen AI Outreach"
                                >
                                  <Sparkles className="w-2 h-2 text-emerald-400" />
                                  <span>{aiGeneratingId === lead.id ? '...' : 'AI'}</span>
                                </button>
                              )}

                              {lead.replyReceived && lead.status !== 'Enquiry Active' && (
                                <button
                                  onClick={() => promoteProspectToEnquiry(lead.id)}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[8px] py-0.5 uppercase tracking-wide flex items-center justify-center space-x-1 mt-1"
                                >
                                  <span>Convert Deal</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-24 border border-dashed border-neutral-200 flex items-center justify-center text-center text-neutral-400 text-[9px] uppercase">
                          Drop Leads Here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Outbound Copy & Automation Campaign Scheduler sidebar */}
        <div className="space-y-4">
          {/* Campaign Outbox Sequence Scheduler */}
          <div className="bg-white border border-neutral-200 p-3 rounded-none">
            <span className="font-bold text-[9px] text-neutral-400 uppercase tracking-wider block border-b pb-1 mb-2">Outbound Automation Sequences</span>
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="p-2 border border-neutral-100 bg-neutral-50 text-[10px] space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-neutral-950">{c.name}</strong>
                    <span className={`text-[8px] font-bold px-1 ${c.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-200 text-neutral-500'}`}>
                      {c.active ? 'ACTIVE RUNNING' : 'PAUSED'}
                    </span>
                  </div>
                  <p className="text-neutral-500">Audience: {c.targetAudience} &bull; {c.scheduleType}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-neutral-200 text-[9px]">
                    <span>Dispatched today: <strong>{c.sentToday} outbounds</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setCampaigns(prev => prev.map(item => {
                          if (item.id === c.id) return { ...item, active: !item.active };
                          return item;
                        }));
                        triggerToast(`${c.name} automation status modified.`);
                      }}
                      className="text-neutral-900 underline hover:no-underline font-bold uppercase"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Copywriting Draft Display Box */}
          <div className="bg-white border border-neutral-200 p-3 rounded-none">
            <div className="border-b pb-1.5 mb-2 flex justify-between items-center">
              <span className="font-bold text-[9px] text-neutral-400 uppercase tracking-wider block">AI Custom Copywriter Playground</span>
              <div className="flex items-center space-x-1">
                <span className="text-[8px] text-neutral-400">Tone:</span>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="bg-neutral-100 border border-neutral-200 text-[8px] focus:outline-none"
                >
                  <option value="Premium">Premium</option>
                  <option value="Urgent">Urgent Promo</option>
                  <option value="Direct">Concise Direct</option>
                </select>
              </div>
            </div>

            <p className="text-neutral-500 mb-2">Click "Gen AI Outreach" on any active prospect. The customized B2B proposal drafted via Gemini AI will populate instantly below for review and outbound scheduling.</p>

            <div className="bg-neutral-50 border p-2 min-h-[140px] text-neutral-800 leading-relaxed font-mono whitespace-pre-wrap text-[9px]">
              {prospects.some(p => p.aiDraft) ? (
                prospects.find(p => p.aiDraft && p.status !== 'Enquiry Active')?.aiDraft || "Select an active unpromoted lead to draft outbound campaign pitch text."
              ) : (
                "Initiate copywriting outbound sequence with Google Gemini Outbound models."
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PROSPECT POPUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-350 max-w-md w-full p-4 space-y-4 shadow-xl text-[10px]">
            <div className="border-b pb-2 flex justify-between items-center">
              <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-900">Add New Outreach Lead</span>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-black font-black text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCompany.trim() || !newContact.trim() || !newEmail.trim() || !newCrop.trim()) {
                  triggerToast('Please fill all required fields.');
                  return;
                }
                const nextId = `PRP-2026-${Math.floor(Math.random() * 900) + 100}`;
                const newProspect: Prospect = {
                  id: nextId,
                  companyName: newCompany,
                  contactName: newContact,
                  email: newEmail,
                  cropInterest: newCrop,
                  estimatedVolume: newVolume,
                  status: newStatus,
                  replyReceived: false,
                  lastOutboundCampaign: 'Custom Manual Entry',
                  emailsSent: 0,
                  nextSchedule: 'Sourcing Backlog',
                  sentiment: newSentiment,
                  aiDraft: ''
                };
                setProspects([newProspect, ...prospects]);
                setShowCreateModal(false);
                triggerToast(`Created outreach prospect: ${newProspect.companyName}`);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="font-bold uppercase text-neutral-500 block">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Import Ltd"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Contact Person *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Contact Email *</label>
                  <input
                    type="email"
                    placeholder="e.g. jane@acme.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Crop Interest *</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Sesame"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                    required
                />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Est Sourcing Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 20 Metric Tons"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Sentiment</label>
                  <select
                    value={newSentiment}
                    onChange={(e) => setNewSentiment(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none text-[11px]"
                  >
                    {sentimentOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Pipeline Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none text-[11px]"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-neutral-300 hover:bg-neutral-100 py-1 px-3 uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-4 uppercase"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
