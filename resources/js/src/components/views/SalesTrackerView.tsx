import React, { useState, useMemo } from 'react';
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
  Eye,
  ArrowRight
} from 'lucide-react';
import { Enquiry, User } from '../../types/crm';

interface EnquiryCustomViewCondition {
  field: keyof Enquiry;
  operator: 'equals' | 'contains' | 'not_equals';
  value: string;
}

interface EnquiryCustomView {
  id: string;
  name: string;
  conditions: EnquiryCustomViewCondition[];
  isBuiltIn?: boolean;
}

interface SalesTrackerViewProps {
  enquiries: Enquiry[];
  filteredEnquiries: Enquiry[];
  setEnquiries: React.Dispatch<React.SetStateAction<Enquiry[]>>;
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  triggerToast: (msg: string) => void;
  handleUpdateEnquiryStatus?: (id: string, status: string) => Promise<void>;
  searchQuery?: string;
}

export function SalesTrackerView({
  enquiries,
  filteredEnquiries,
  setEnquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
  currentUser,
  triggerToast,
  handleUpdateEnquiryStatus,
  searchQuery = '',
}: SalesTrackerViewProps) {
  // Local UI States
  const [displayMode, setDisplayMode] = useState<'table' | 'kanban'>('table');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Custom View Builder states
  const [showBuilder, setShowBuilder] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [conditions, setConditions] = useState<EnquiryCustomViewCondition[]>([
    { field: 'status', operator: 'equals', value: 'Costing Phase' }
  ]);

  // Create Enquiry Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('15 Metric Tons');
  const [newDestinationPort, setNewDestinationPort] = useState('Hamburg, Germany');
  const [newStatus, setNewStatus] = useState('Costing Phase');
  const [newSalesOwner, setNewSalesOwner] = useState(currentUser.name);

  // Options for custom views builder
  const enquiryFields: { value: keyof Enquiry; label: string }[] = [
    { value: 'customerName', label: 'Client Firm' },
    { value: 'customerContact', label: 'Contact Person' },
    { value: 'product', label: 'Product Specification' },
    { value: 'quantity', label: 'Sourcing Volume' },
    { value: 'destinationPort', label: 'Discharge Port' },
    { value: 'status', label: 'Phase / Status' },
    { value: 'salesOwner', label: 'Sales Owner' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_equals', label: 'Does Not Equal' }
  ] as const;

  const statusOptions = ['Costing Phase', 'Internal Review', 'Customs Verification', 'Completed'];

  // Custom Views list (loaded from localStorage or initialized with defaults)
  const [customViews, setCustomViews] = useState<EnquiryCustomView[]>(() => {
    const stored = localStorage.getItem('aftermeet_enquiry_custom_views');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse enquiry custom views:', e);
      }
    }
    return [
      {
        id: 'view-costing-phase',
        name: 'Costing Stage',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Costing Phase' }
        ],
        isBuiltIn: true
      },
      {
        id: 'view-my-deals',
        name: 'My Enquiries',
        conditions: [
          { field: 'salesOwner', operator: 'equals', value: currentUser.name }
        ],
        isBuiltIn: true
      },
      {
        id: 'view-hamburg',
        name: 'Hamburg Transits',
        conditions: [
          { field: 'destinationPort', operator: 'contains', value: 'Hamburg' }
        ],
        isBuiltIn: true
      }
    ];
  });

  const [activeCustomViewId, setActiveCustomViewId] = useState<string | null>(null);

  // Handle building view
  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'status', operator: 'equals', value: 'Costing Phase' }]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: keyof EnquiryCustomViewCondition, value: any) => {
    setConditions(prev => prev.map((cond, i) => {
      if (i === index) {
        return { ...cond, [field]: value };
      }
      return cond;
    }));
  };

  const handleSaveView = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) {
      triggerToast('Please provide a name for your custom view.');
      return;
    }
    const id = `view-${Date.now()}`;
    const newView: EnquiryCustomView = { id, name: newViewName, conditions };
    const updated = [...customViews, newView];
    setCustomViews(updated);
    localStorage.setItem('aftermeet_enquiry_custom_views', JSON.stringify(updated));
    setActiveCustomViewId(id);
    setNewViewName('');
    setConditions([{ field: 'status', operator: 'equals', value: 'Costing Phase' }]);
    setShowBuilder(false);
    triggerToast(`Saved custom view "${newViewName}"`);
  };

  const handleDeleteCustomView = (id: string) => {
    const updated = customViews.filter(v => v.id !== id);
    setCustomViews(updated);
    localStorage.setItem('aftermeet_enquiry_custom_views', JSON.stringify(updated));
    if (activeCustomViewId === id) {
      setActiveCustomViewId(null);
    }
    triggerToast('Custom view removed');
  };

  // Filter enquiries dynamically based on active Custom View conditions, header search, and local search
  // Note: Sales Enquiry module is scoped specifically to Export Sales deals (sales_type === 'export')
  const filteredList = useMemo(() => {
    let list = enquiries.filter(e => !e.sales_type || e.sales_type === 'export');

    // 1. Apply Active Custom View Conditions
    if (activeCustomViewId) {
      const activeView = customViews.find(v => v.id === activeCustomViewId);
      if (activeView) {
        list = list.filter(e => {
          return activeView.conditions.every(cond => {
            const fieldValue = String(e[cond.field as keyof Enquiry] || '').toLowerCase();
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

    // 2. Apply Header Search Query (if passed)
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.product.toLowerCase().includes(q)
      );
    }

    // 3. Apply Local Search Query
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      list = list.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.customerContact.toLowerCase().includes(q) ||
        e.product.toLowerCase().includes(q) ||
        e.destinationPort.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        e.salesOwner.toLowerCase().includes(q)
      );
    }

    return list;
  }, [enquiries, activeCustomViewId, customViews, searchQuery, tableSearchQuery]);

  // React Table Columns setup
  const columns = useMemo<ColumnDef<Enquiry>[]>(() => [
    {
      accessorKey: 'id',
      header: 'Enquiry ID',
      cell: info => <span className="font-mono font-bold text-neutral-900">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'customerName',
      header: 'Client Firm & Contact',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-bold text-neutral-950">{row.customerName}</span>
            <span className="block text-neutral-500 text-[9px]">{row.customerContact}</span>
          </div>
        );
      }
    },
    {
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
      accessorKey: 'destinationPort',
      header: 'Discharge Port',
      cell: info => <span className="font-mono">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Phase / Status',
      cell: info => {
        const val = info.getValue() as string;
        let color = 'bg-neutral-100 text-neutral-700 border-neutral-200';
        if (val === 'Costing Phase') {
          color = 'bg-amber-50 text-amber-800 border-amber-200';
        } else if (val === 'Internal Review') {
          color = 'bg-blue-50 text-blue-800 border-blue-200';
        } else if (val === 'Customs Verification') {
          color = 'bg-purple-50 text-purple-800 border-purple-200';
        } else if (val === 'Completed' || val.toLowerCase().includes('won')) {
          color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        }
        return <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold border uppercase ${color}`}>{val}</span>;
      }
    },
    {
      accessorKey: 'salesOwner',
      header: 'Owner',
      cell: info => <span className="font-medium text-neutral-600">{info.getValue() as string}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: info => {
        const enq = info.row.original;
        return (
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEnquiryId(enq.id);
                setCurrentView('enquiry-detail');
                setActiveTab('Overview');
              }}
              className="bg-black hover:bg-neutral-800 text-white text-[9px] px-2.5 py-0.5 rounded-none uppercase font-bold"
            >
              View Hub →
            </button>
          </div>
        );
      }
    }
  ], [setSelectedEnquiryId, setCurrentView, setActiveTab]);

  // Tanstack React Table initialization
  const table = useReactTable({
    data: filteredList,
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
  const handleDragStart = (e: React.DragEvent, enquiryId: string) => {
    e.dataTransfer.setData('text/plain', enquiryId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    if (handleUpdateEnquiryStatus) {
      await handleUpdateEnquiryStatus(id, targetStatus);
    } else {
      // Fallback
      setEnquiries(prev => prev.map(item => item.id === id ? { ...item, status: targetStatus } : item));
      triggerToast(`Enquiry status updated to ${targetStatus}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Header & Switcher */}
      <div className="border-b border-neutral-200 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 text-[9px] font-black px-1.5 py-0.5 border border-blue-300 uppercase">Export Sales Scope</span>
            <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Sales Enquiry Workspace</h1>
          </div>
          <p className="text-neutral-500 text-[10px] mt-0.5">Department-specific workspace for Export Sales deals, costing models, and ocean freight shipping pipelines.</p>
        </div>

        {/* View switcher and New Enquiry Button */}
        <div className="flex items-center space-x-2 shrink-0 self-end">
          <div className="bg-neutral-100 p-0.5 flex space-x-0.5 border border-neutral-200">
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-1 flex items-center space-x-1 text-[9px] uppercase font-bold ${
                displayMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setDisplayMode('kanban')}
              className={`p-1 flex items-center space-x-1 text-[9px] uppercase font-bold ${
                displayMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
              }`}
              title="Kanban Board"
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewCustomerName('');
              setNewCustomerContact('');
              setNewProduct('');
              setNewQuantity('15 Metric Tons');
              setNewDestinationPort('Hamburg, Germany');
              setNewStatus('Costing Phase');
              setNewSalesOwner(currentUser.name);
              setShowCreateModal(true);
            }}
            className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-2.5 rounded-none text-[10px] uppercase flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Enquiry</span>
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
            All Enquiries ({enquiries.length})
          </button>

          {/* Render built-in & user custom views */}
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
          <span>{showBuilder ? 'Close View Creator' : 'Create Custom View'}</span>
        </button>
      </div>

      {/* CUSTOM VIEW BUILDER */}
      {showBuilder && (
        <form onSubmit={handleSaveView} className="bg-neutral-50 border p-3.5 space-y-3 text-[10px]">
          <div className="border-b pb-1">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400">Enquiry Custom View Creator</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-neutral-500">View Name</label>
              <input
                type="text"
                placeholder="e.g. Sesame Leads, High Volume"
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
                  onChange={(e) => handleConditionChange(index, 'field', e.target.value as keyof Enquiry)}
                  className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                >
                  {enquiryFields.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={cond.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                {cond.field === 'status' ? (
                  <select
                    value={cond.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                  >
                    {statusOptions.map(st => (
                      <option key={st} value={st}>{st}</option>
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

      {/* KPI Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Current View Count</span>
          <p className="text-base font-black text-neutral-900 mt-1">{filteredList.length} Matching Deals</p>
          <span className="text-neutral-500 text-[9px]">Out of {enquiries.length} total active deals</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Costing desk queues</span>
          <p className="text-base font-black text-neutral-900 mt-1">
            {enquiries.filter(e => e.status === 'Costing Phase').length} Active Requests
          </p>
          <span className="text-amber-600 text-[9px] font-bold">● Operations Estimating</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Completed / won pipe</span>
          <p className="text-base font-black text-neutral-900 mt-1">
            {enquiries.filter(e => e.status === 'Completed' || e.status === 'Won' || e.status.toLowerCase().includes('won')).length} Deals Won
          </p>
          <span className="text-neutral-500 text-[9px]">Based on active database records</span>
        </div>
        <div className="bg-white border p-3 font-mono">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active Sales Owners</span>
          <p className="text-base font-black text-emerald-600 mt-1">
            {new Set(enquiries.map(e => e.salesOwner)).size} Users
          </p>
          <span className="text-neutral-500 text-[9px]">Managing corporate portfolios</span>
        </div>
      </div>

      {/* Main interactive area based on selected mode */}
      <div className="bg-white border border-neutral-200 p-3 rounded-none space-y-3">
        {displayMode === 'table' ? (
          <>
            {/* Table search, view options and visibility toggles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-neutral-100">
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-neutral-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search in these enquiries..."
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
                      <label key={column.id} className="flex items-center space-x-2 py-0.5 hover:bg-neutral-50 cursor-pointer font-medium">
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
                      <tr
                        key={row.id}
                        onClick={() => {
                          setSelectedEnquiryId(row.original.id);
                          setCurrentView('enquiry-detail');
                          setActiveTab('Overview');
                        }}
                        className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
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
                        No enquiries found matching current criteria.
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
                  className="bg-neutral-50 border border-neutral-200 p-1 focus:outline-none font-bold"
                >
                  {[5, 10, 20].map(size => (
                    <option key={size} value={size}>{size} deals</option>
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
          </>
        ) : (
          /* INTERACTIVE KANBAN BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {statusOptions.map(colStatus => {
              const columnEnquiries = filteredList.filter(e => e.status === colStatus);
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
                      {columnEnquiries.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {columnEnquiries.length > 0 ? (
                      columnEnquiries.map(enq => (
                        <div
                          key={enq.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, enq.id)}
                          onClick={() => {
                            setSelectedEnquiryId(enq.id);
                            setCurrentView('enquiry-detail');
                            setActiveTab('Overview');
                          }}
                          className="bg-white border border-neutral-200 p-2.5 cursor-grab active:cursor-grabbing hover:border-black transition-all space-y-1.5 shadow-2xs relative group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-neutral-400 text-[8px]">{enq.id}</span>
                            <span className="inline-block px-1 py-0.2 text-[7px] font-bold border uppercase bg-neutral-50 text-neutral-600 border-neutral-100">
                              {enq.salesOwner}
                            </span>
                          </div>

                          <div>
                            <strong className="block text-neutral-900 text-[11px] leading-tight font-black">{enq.customerName}</strong>
                            <span className="text-neutral-500 text-[9px] block">{enq.customerContact}</span>
                          </div>

                          <div className="text-[9px] border-t border-neutral-100 pt-1.5 space-y-0.5">
                            <span className="block text-neutral-700">📦 Crop: <span className="font-bold">{enq.product}</span></span>
                            <span className="block text-neutral-400">⚖ Vol: {enq.quantity}</span>
                          </div>

                          {/* Fallback inline dropdown to modify status */}
                          <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100">
                            <select
                              value={enq.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={async (e) => {
                                e.stopPropagation();
                                if (handleUpdateEnquiryStatus) {
                                  await handleUpdateEnquiryStatus(enq.id, e.target.value);
                                } else {
                                  setEnquiries(prev => prev.map(item => item.id === enq.id ? { ...item, status: e.target.value } : item));
                                  triggerToast(`Enquiry status updated to ${e.target.value}`);
                                }
                              }}
                              className="bg-neutral-50 border border-neutral-200 text-[8px] px-1 py-0.5 focus:outline-none font-bold"
                            >
                              {statusOptions.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEnquiryId(enq.id);
                                setCurrentView('enquiry-detail');
                                setActiveTab('Overview');
                              }}
                              className="ml-auto bg-neutral-950 text-white text-[7px] font-bold px-1.5 py-0.5 uppercase flex items-center space-x-0.5"
                              title="View detail hub"
                            >
                              <span>Hub</span>
                              <ArrowRight className="w-2 h-2 text-white" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-24 border border-dashed border-neutral-200 flex items-center justify-center text-center text-neutral-400 text-[9px] uppercase">
                        Drop Deals Here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE ENQUIRY POPUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-350 max-w-md w-full p-4 space-y-4 shadow-xl text-[10px]">
            <div className="border-b pb-2 flex justify-between items-center">
              <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-900">Add Live Enquiry Request</span>
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
                if (!newCustomerName.trim() || !newCustomerContact.trim() || !newProduct.trim()) {
                  triggerToast('Please fill all required fields.');
                  return;
                }
                const generatedId = `ENQ-2026-${Math.floor(Math.random() * 9000) + 1000}`;
                const newEnq: Enquiry = {
                  id: generatedId,
                  sales_type: 'export',
                  owningDepartment: 'Sales',
                  customerName: newCustomerName,
                  customerContact: newCustomerContact,
                  product: newProduct,
                  quantity: newQuantity,
                  destinationPort: newDestinationPort,
                  status: newStatus,
                  salesOwner: newSalesOwner,
                  exportDetails: {
                    destinationCountry: newDestinationPort.includes(',') ? newDestinationPort.split(',')[1]!.trim() : newDestinationPort,
                    incoterms: `CIF ${newDestinationPort}`,
                    shippingDetails: 'Standard Ocean Freight Container',
                    exportStage: 'costing'
                  },
                  watchers: [],
                  createdDate: new Date().toISOString().split('T')[0] || '2026-07-19',
                  timeline: [
                    { id: 1, text: 'Enquiry initialized', user: currentUser.name, date: 'Just now' }
                  ],
                  quotations: [{
                    id: `QTN-2026-${Math.floor(Math.random() * 900) + 100}`,
                    version: 'v1.0',
                    stage: 'Costing',
                    pricing: { baseCost: '—', logistics: '—', margin: '—', finalPrice: '—' },
                    costSheetUploaded: false,
                    fileName: 'Pending_Proposal.pdf'
                  }],
                  sampling: { id: `SMP-2026-${Math.floor(Math.random()*900)+100}`, stage: 'Requested', carrier: 'DHL', trackingNumber: 'Pending', notes: 'Moisture target matches specs.' },
                  purchaseOrder: null,
                  vendorApproval: { stage: 'Requested', vendorName: 'Thai Farms Joint-Venture', score: '88 out of 100', complianceCheck: 'Awaiting Assessment' },
                  contract: { version: 'v1.0-draft', signatureStatus: 'Awaiting Signature', file: 'Draft_Contract.pdf' },
                  tasks: []
                };

                setEnquiries([newEnq, ...enquiries]);
                setShowCreateModal(false);
                triggerToast(`Created new Enquiry: ${generatedId}`);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="font-bold uppercase text-neutral-500 block">Client Firm *</label>
                <input
                  type="text"
                  placeholder="e.g. Siam Agritech Co."
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-neutral-500 block">Contact Person *</label>
                <input
                  type="text"
                  placeholder="e.g. Somchai Prasert"
                  value={newCustomerContact}
                  onChange={(e) => setNewCustomerContact(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-neutral-500 block">Product Specification *</label>
                <input
                  type="text"
                  placeholder="e.g. White Pepper Powder (Steam Treated)"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Sourcing Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Metric Tons"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Discharge Port</label>
                  <input
                    type="text"
                    placeholder="e.g. Hamburg, Germany"
                    value={newDestinationPort}
                    onChange={(e) => setNewDestinationPort(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Pipeline Phase</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none text-[11px] font-bold"
                  >
                    {statusOptions.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Sales Owner</label>
                  <input
                    type="text"
                    value={newSalesOwner}
                    onChange={(e) => setNewSalesOwner(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
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
                  Create Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
