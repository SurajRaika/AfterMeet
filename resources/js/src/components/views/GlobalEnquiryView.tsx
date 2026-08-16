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
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  ArrowRight,
  Globe,
  FileText,
  Building,
  Store,
  PieChart,
  Trash2
} from 'lucide-react';
import { Enquiry, User, SalesType } from '../../types/crm';

interface GlobalCustomViewCondition {
  field: keyof Enquiry | 'sales_type';
  operator: 'equals' | 'contains' | 'not_equals';
  value: string;
}

interface GlobalCustomView {
  id: string;
  name: string;
  conditions: GlobalCustomViewCondition[];
  isBuiltIn?: boolean;
}

interface GlobalEnquiryViewProps {
  enquiries: Enquiry[];
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  triggerToast: (msg: string) => void;
  searchQuery?: string;
}

export function GlobalEnquiryView({
  enquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
  currentUser,
  triggerToast,
  searchQuery = '',
}: GlobalEnquiryViewProps) {
  // Local UI States
  const [selectedChannel, setSelectedChannel] = useState<SalesType | 'all'>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Custom View Builder states
  const [showBuilder, setShowBuilder] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [conditions, setConditions] = useState<GlobalCustomViewCondition[]>([
    { field: 'sales_type', operator: 'equals', value: 'tender' }
  ]);

  // Options for custom views builder
  const enquiryFields: { value: keyof Enquiry | 'sales_type'; label: string }[] = [
    { value: 'sales_type', label: 'Sales Channel / Type' },
    { value: 'customerName', label: 'Customer / Agency Name' },
    { value: 'product', label: 'Product Requirement' },
    { value: 'quantity', label: 'Quantity / Volume' },
    { value: 'destinationPort', label: 'Destination / Port' },
    { value: 'status', label: 'Generic Status' },
    { value: 'salesOwner', label: 'Sales Owner' },
    { value: 'owningDepartment', label: 'Owning Department' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_equals', label: 'Does Not Equal' }
  ] as const;

  const salesTypeOptions: { value: SalesType; label: string }[] = [
    { value: 'export', label: 'Export Sales' },
    { value: 'tender', label: 'Government Tender' },
    { value: 'distributor', label: 'Distributor Sales' },
    { value: 'retail', label: 'Retail / Supermarket' }
  ];

  // Custom Views list (loaded from localStorage or initialized with defaults)
  const [customViews, setCustomViews] = useState<GlobalCustomView[]>(() => {
    const stored = localStorage.getItem('aftermeet_global_enquiry_custom_views');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse global enquiry custom views:', e);
      }
    }
    return [
      {
        id: 'view-tenders-only',
        name: 'Government Tenders',
        conditions: [
          { field: 'sales_type', operator: 'equals', value: 'tender' }
        ],
        isBuiltIn: true
      },
      {
        id: 'view-won-all',
        name: 'Won / Confirmed Deals',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Won' }
        ],
        isBuiltIn: true
      },
      {
        id: 'view-export-channel',
        name: 'Export Channel',
        conditions: [
          { field: 'sales_type', operator: 'equals', value: 'export' }
        ],
        isBuiltIn: true
      }
    ];
  });

  const [activeCustomViewId, setActiveCustomViewId] = useState<string | null>(null);

  // Handle building custom views
  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'sales_type', operator: 'equals', value: 'tender' }]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: keyof GlobalCustomViewCondition, value: any) => {
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
    const id = `gview-${Date.now()}`;
    const newView: GlobalCustomView = { id, name: newViewName, conditions };
    const updated = [...customViews, newView];
    setCustomViews(updated);
    localStorage.setItem('aftermeet_global_enquiry_custom_views', JSON.stringify(updated));
    setActiveCustomViewId(id);
    setNewViewName('');
    setConditions([{ field: 'sales_type', operator: 'equals', value: 'tender' }]);
    setShowBuilder(false);
    triggerToast(`Saved global custom view "${newViewName}"`);
  };

  const handleDeleteCustomView = (id: string) => {
    const updated = customViews.filter(v => v.id !== id);
    setCustomViews(updated);
    localStorage.setItem('aftermeet_global_enquiry_custom_views', JSON.stringify(updated));
    if (activeCustomViewId === id) {
      setActiveCustomViewId(null);
    }
    triggerToast('Global custom view removed');
  };

  // Filter list across all enquiries based on channel tabs, custom view conditions, and searches
  const filteredList = useMemo(() => {
    let list = enquiries;

    // 1. Channel Filter Tab
    if (selectedChannel !== 'all') {
      list = list.filter(e => (e.sales_type || 'export') === selectedChannel);
    }

    // 2. Active Custom View Conditions
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

    // 3. Header Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.product.toLowerCase().includes(q) ||
        (e.sales_type && e.sales_type.toLowerCase().includes(q))
      );
    }

    // 4. Local Search Query
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      list = list.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.customerContact.toLowerCase().includes(q) ||
        e.product.toLowerCase().includes(q) ||
        e.destinationPort.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        e.salesOwner.toLowerCase().includes(q) ||
        (e.sales_type && e.sales_type.toLowerCase().includes(q))
      );
    }

    return list;
  }, [enquiries, selectedChannel, activeCustomViewId, customViews, searchQuery, tableSearchQuery]);

  // Channel Breakdown Counts for Dashboard Header
  const channelCounts = useMemo(() => {
    const counts = { export: 0, tender: 0, distributor: 0, retail: 0 };
    enquiries.forEach(e => {
      const st = e.sales_type || 'export';
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });
    return counts;
  }, [enquiries]);

  // Render Sales Type Badge
  const renderSalesTypeBadge = (salesType: SalesType = 'export') => {
    switch (salesType) {
      case 'tender':
        return (
          <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
            <FileText className="w-2.5 h-2.5" />
            <span>Tender</span>
          </span>
        );
      case 'distributor':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
            <Building className="w-2.5 h-2.5" />
            <span>Distributor</span>
          </span>
        );
      case 'retail':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
            <Store className="w-2.5 h-2.5" />
            <span>Retail</span>
          </span>
        );
      case 'export':
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
            <Globe className="w-2.5 h-2.5" />
            <span>Export</span>
          </span>
        );
    }
  };

  // Tanstack Columns
  const columns = useMemo<ColumnDef<Enquiry>[]>(() => [
    {
      accessorKey: 'id',
      header: 'Enquiry ID',
      cell: info => <span className="font-mono font-bold text-neutral-900">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'sales_type',
      header: 'Sales Channel',
      cell: info => renderSalesTypeBadge(info.getValue() as SalesType),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer / Agency',
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
      header: 'Product & Requirement',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-medium">{row.product}</span>
            <span className="block text-neutral-400 text-[9px]">Volume: {row.quantity}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'destinationPort',
      header: 'Discharge / Location',
      cell: info => <span className="font-mono text-neutral-600">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Generic Status',
      cell: info => {
        const val = info.getValue() as string;
        let color = 'bg-neutral-100 text-neutral-700 border-neutral-200';
        if (val.toLowerCase().includes('costing') || val.toLowerCase().includes('in progress')) {
          color = 'bg-amber-50 text-amber-800 border-amber-200';
        } else if (val.toLowerCase().includes('review') || val.toLowerCase().includes('verification')) {
          color = 'bg-blue-50 text-blue-800 border-blue-200';
        } else if (val.toLowerCase().includes('won') || val.toLowerCase().includes('completed')) {
          color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        }
        return <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold border uppercase ${color}`}>{val}</span>;
      }
    },
    {
      accessorKey: 'salesOwner',
      header: 'Owner / Department',
      cell: info => {
        const row = info.row.original;
        return (
          <div>
            <span className="block font-medium text-neutral-700">{row.salesOwner}</span>
            <span className="block text-neutral-400 text-[9px]">{row.owningDepartment || 'Sales'} Desk</span>
          </div>
        );
      }
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
              className="bg-neutral-900 hover:bg-black text-white text-[9px] px-2.5 py-1 rounded-none uppercase font-bold flex items-center space-x-1"
            >
              <span>View Reference Hub</span>
              <ArrowRight className="w-3 h-3 text-white" />
            </button>
          </div>
        );
      }
    }
  ], [setSelectedEnquiryId, setCurrentView, setActiveTab]);

  // Tanstack Table Initialization
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
        pageSize: 10,
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Module Title Header */}
      <div className="border-b border-neutral-200 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-neutral-900 text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider">Universal Spine Directory</span>
            <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Global Enquiry Directory</h1>
          </div>
          <p className="text-neutral-500 text-[10px] mt-0.5">
            Single cross-cutting view of every enquiry across Export, Government Tender, Distributor, and Retail sales channels.
          </p>
        </div>

        {/* Directory Notice Badge */}
        <div className="bg-amber-50 border border-amber-200 p-1.5 px-3 rounded-none text-[9px] text-amber-900 font-mono flex items-center space-x-2 shrink-0">
          <PieChart className="w-3.5 h-3.5 text-amber-700" />
          <span>Read-Only Cross-Department Reference Directory (No Kanban Pipeline)</span>
        </div>
      </div>

      {/* EXECUTIVE CHANNEL METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-[10px]">
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total Universal Enquiries</span>
          <p className="text-lg font-black text-neutral-900 mt-1">{enquiries.length} Active Records</p>
          <span className="text-neutral-500 text-[9px]">Across all sales channels</span>
        </div>

        <div className="bg-white border p-3 flex items-center justify-between">
          <div>
            <span className="text-blue-600 text-[8px] uppercase font-bold block">Export Sales</span>
            <p className="text-base font-black text-neutral-900 mt-0.5">{channelCounts.export} Deals</p>
            <span className="text-neutral-400 text-[8px]">Export Sales Dept</span>
          </div>
          <Globe className="w-5 h-5 text-blue-400" />
        </div>

        <div className="bg-white border p-3 flex items-center justify-between">
          <div>
            <span className="text-purple-600 text-[8px] uppercase font-bold block">Government Tenders</span>
            <p className="text-base font-black text-neutral-900 mt-0.5">{channelCounts.tender} Bids</p>
            <span className="text-neutral-400 text-[8px]">Tender Dept</span>
          </div>
          <FileText className="w-5 h-5 text-purple-400" />
        </div>

        <div className="bg-white border p-3 flex items-center justify-between">
          <div>
            <span className="text-amber-600 text-[8px] uppercase font-bold block">Distributor Sales</span>
            <p className="text-base font-black text-neutral-900 mt-0.5">{channelCounts.distributor} Leads</p>
            <span className="text-neutral-400 text-[8px]">Distributor Dept</span>
          </div>
          <Building className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-white border p-3 flex items-center justify-between">
          <div>
            <span className="text-emerald-600 text-[8px] uppercase font-bold block">Retail & Supermarket</span>
            <p className="text-base font-black text-neutral-900 mt-0.5">{channelCounts.retail} Accounts</p>
            <span className="text-neutral-400 text-[8px]">Retail Dept</span>
          </div>
          <Store className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* CHANNEL TABS + CUSTOM VIEW FILTERING BAR */}
      <div className="bg-white border p-2 space-y-2 text-[10px]">
        {/* Sales Channel Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b pb-2">
          <span className="text-neutral-400 font-bold uppercase mr-2 tracking-wider text-[9px]">Channel Filter:</span>
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-3 py-1 font-bold border uppercase text-[9px] transition-all ${
              selectedChannel === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            All Channels ({enquiries.length})
          </button>
          <button
            onClick={() => setSelectedChannel('export')}
            className={`px-3 py-1 font-bold border uppercase text-[9px] transition-all flex items-center space-x-1 ${
              selectedChannel === 'export'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Export ({channelCounts.export})</span>
          </button>
          <button
            onClick={() => setSelectedChannel('tender')}
            className={`px-3 py-1 font-bold border uppercase text-[9px] transition-all flex items-center space-x-1 ${
              selectedChannel === 'tender'
                ? 'bg-purple-900 text-white border-purple-900'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Tenders ({channelCounts.tender})</span>
          </button>
          <button
            onClick={() => setSelectedChannel('distributor')}
            className={`px-3 py-1 font-bold border uppercase text-[9px] transition-all flex items-center space-x-1 ${
              selectedChannel === 'distributor'
                ? 'bg-amber-800 text-white border-amber-800'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>Distributors ({channelCounts.distributor})</span>
          </button>
          <button
            onClick={() => setSelectedChannel('retail')}
            className={`px-3 py-1 font-bold border uppercase text-[9px] transition-all flex items-center space-x-1 ${
              selectedChannel === 'retail'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Retail ({channelCounts.retail})</span>
          </button>
        </div>

        {/* Custom Views Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-neutral-400 font-bold uppercase mr-2 tracking-wider text-[9px]">Custom Filter Views:</span>
            <button
              onClick={() => setActiveCustomViewId(null)}
              className={`px-2.5 py-1 font-bold border text-[9px] transition-all ${
                activeCustomViewId === null
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
              }`}
            >
              Default Filter
            </button>

            {customViews.map(view => {
              const isActive = activeCustomViewId === view.id;
              return (
                <div key={view.id} className="flex items-center">
                  <button
                    onClick={() => setActiveCustomViewId(view.id)}
                    className={`px-2.5 py-1 font-bold border transition-all text-[9px] ${
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
            className="text-neutral-900 underline hover:no-underline font-bold uppercase flex items-center space-x-1 text-[9px]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showBuilder ? 'Close Rule Builder' : 'Create Custom View Rule'}</span>
          </button>
        </div>
      </div>

      {/* CUSTOM VIEW BUILDER FORM */}
      {showBuilder && (
        <form onSubmit={handleSaveView} className="bg-neutral-50 border p-3.5 space-y-3 text-[10px]">
          <div className="border-b pb-1">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400">Global Directory Custom View Creator</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-neutral-500">View Name</label>
              <input
                type="text"
                placeholder="e.g. Government Bids, European Deals"
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

                {cond.field === 'sales_type' ? (
                  <select
                    value={cond.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                  >
                    {salesTypeOptions.map(st => (
                      <option key={st.value} value={st.value}>{st.label}</option>
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

      {/* TABLE WORKSPACE AREA */}
      <div className="bg-white border border-neutral-200 p-3 rounded-none space-y-3">
        {/* Table Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-neutral-100">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search across all channels & enquiries..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 pl-8 pr-2 py-1 text-[10px] focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 self-end">
            <span className="text-[9px] text-neutral-500 font-bold">Showing {filteredList.length} of {enquiries.length} records</span>

            {/* Column Visibility Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="border border-neutral-200 hover:bg-neutral-50 px-2 py-1 flex items-center space-x-1 font-bold text-[9px] uppercase"
              >
                <Eye className="w-3 h-3" />
                <span>Columns</span>
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
                    No enquiries found in global directory matching filter criteria.
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
              {[10, 20, 50].map(size => (
                <option key={size} value={size}>{size} per page</option>
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
    </div>
  );
}
