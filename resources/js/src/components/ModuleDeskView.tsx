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
  Eye
} from 'lucide-react';

export interface CustomViewCondition<T> {
  field: keyof T;
  operator: 'equals' | 'contains' | 'not_equals';
  value: string;
}

export interface CustomView<T> {
  id: string;
  name: string;
  conditions: CustomViewCondition<T>[];
  isBuiltIn?: boolean;
}

export interface ModuleDeskViewProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  data: T[];
  columns: ColumnDef<T>[];

  // Kanban Configuration
  kanbanColumns: string[];
  getKanbanColumnValue: (item: T) => string;
  onUpdateStatus?: (id: string, newStatus: string) => void | Promise<void>;
  renderKanbanCard: (item: T, onSelect: () => void) => React.ReactNode;

  // Custom View Builder Configurations
  localStorageKey: string;
  defaultCustomViews: CustomView<T>[];
  fieldsForCustomView: { value: keyof T; label: string }[];

  // Stats Counters
  stats: {
    label: string;
    value: string | number;
    subtext?: string;
    subtextColorClass?: string;
  }[];

  // Action Add button
  onAddClick?: () => void;
  addButtonLabel?: string;

  // Selection
  onItemSelect: (item: T) => void;

  // Searching field matching helper
  globalSearchFields: (keyof T)[];
}

export function ModuleDeskView<T extends { id: string }>({
  title,
  subtitle,
  data,
  columns,
  kanbanColumns,
  getKanbanColumnValue,
  onUpdateStatus,
  renderKanbanCard,
  localStorageKey,
  defaultCustomViews,
  fieldsForCustomView,
  stats,
  onAddClick,
  addButtonLabel = 'Add New',
  onItemSelect,
  globalSearchFields,
}: ModuleDeskViewProps<T>) {
  const [displayMode, setDisplayMode] = useState<'table' | 'kanban'>('table');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Custom View Builder states
  const [showBuilder, setShowBuilder] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [conditions, setConditions] = useState<CustomViewCondition<T>[]>([
    { field: fieldsForCustomView[0]?.value as keyof T, operator: 'equals', value: '' }
  ]);

  const [customViews, setCustomViews] = useState<CustomView<T>[]>(() => {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse custom views:', e);
      }
    }
    return defaultCustomViews;
  });

  const [activeCustomViewId, setActiveCustomViewId] = useState<string | null>(null);

  // Rule builder actions
  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { field: fieldsForCustomView[0]?.value as keyof T, operator: 'equals', value: '' }
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: keyof CustomViewCondition<T>, value: any) => {
    setConditions(prev => prev.map((cond, i) => {
      if (i === index) {
        return { ...cond, [field]: value };
      }
      return cond;
    }));
  };

  const handleSaveView = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;
    const id = `view-${Date.now()}`;
    const newView: CustomView<T> = { id, name: newViewName, conditions };
    const updated = [...customViews, newView];
    setCustomViews(updated);
    localStorage.setItem(localStorageKey, JSON.stringify(updated));
    setActiveCustomViewId(id);
    setNewViewName('');
    setConditions([{ field: fieldsForCustomView[0]?.value as keyof T, operator: 'equals', value: '' }]);
    setShowBuilder(false);
  };

  const handleDeleteCustomView = (id: string) => {
    const updated = customViews.filter((v) => v.id !== id);
    setCustomViews(updated);
    localStorage.setItem(localStorageKey, JSON.stringify(updated));
    if (activeCustomViewId === id) {
      setActiveCustomViewId(null);
    }
  };

  // Filter list based on custom view rules & search query
  const filteredList = useMemo(() => {
    let list = data;

    // 1. Active Custom View conditions
    if (activeCustomViewId) {
      const activeView = customViews.find((v) => v.id === activeCustomViewId);
      if (activeView) {
        list = list.filter(item => {
          return activeView.conditions.every((cond: any) => {
            const fieldValue = String(item[cond.field as keyof T] || '').toLowerCase();
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

    // 2. Local Search Input
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      list = list.filter(item => {
        return globalSearchFields.some(f => {
          const val = String(item[f] || '').toLowerCase();
          return val.includes(q);
        });
      });
    }

    return list;
  }, [data, activeCustomViewId, customViews, tableSearchQuery, globalSearchFields]);

  // Tanstack Table Setup
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

  // Kanban HTML5 Drag-and-Drop state handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    if (onUpdateStatus) {
      await onUpdateStatus(id, targetStatus);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Block */}
      <div className="border-b border-neutral-200 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">{title}</h1>
          <p className="text-neutral-500 text-[10px]">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end">
          <div className="bg-neutral-100 p-0.5 flex space-x-0.5 border border-neutral-200">
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-1 flex items-center space-x-1 text-[9px] uppercase font-bold ${
                displayMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
              }`}
              type="button"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setDisplayMode('kanban')}
              className={`p-1 flex items-center space-x-1 text-[9px] uppercase font-bold ${
                displayMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
              }`}
              type="button"
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {onAddClick && (
            <button
              onClick={onAddClick}
              className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-2.5 rounded-none text-[10px] uppercase flex items-center space-x-1"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom View Presets */}
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
            type="button"
          >
            All Items ({data.length})
          </button>

          {Array.isArray(customViews) && customViews.map((view: any) => {
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
                  type="button"
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
                    type="button"
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
          className="text-neutral-900 underline hover:no-underline font-bold uppercase flex items-center space-x-1 text-[10px]"
          type="button"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showBuilder ? 'Close View Creator' : 'Create Custom View'}</span>
        </button>
      </div>

      {/* Rule Builder Panel */}
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
                placeholder="e.g. Important, Sourcing Team, Volume"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="w-full bg-white border border-neutral-200 p-1.5 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold uppercase text-neutral-500 block">Match all of the following rules:</span>
            {conditions.map((cond, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 bg-white p-2 border border-neutral-100">
                <select
                  value={String(cond.field)}
                  onChange={(e) => handleConditionChange(index, 'field', e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                >
                  {fieldsForCustomView.map(f => (
                    <option key={String(f.value)} value={String(f.value)}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={cond.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 p-1 font-medium focus:outline-none"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="not_equals">Does Not Equal</option>
                </select>

                <input
                  type="text"
                  placeholder="Value..."
                  value={cond.value}
                  onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 p-1 focus:outline-none"
                  required
                />

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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border p-3">
            <span className="text-neutral-400 text-[8px] uppercase font-bold block">{stat.label}</span>
            <p className="text-base font-black text-neutral-900 mt-1">{stat.value}</p>
            {stat.subtext && (
              <span className={`text-[9px] ${stat.subtextColorClass || 'text-neutral-500'}`}>{stat.subtext}</span>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Main Viewport Area */}
      <div className="bg-white border border-neutral-200 p-3 rounded-none space-y-3">
        {displayMode === 'table' ? (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-neutral-100">
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-neutral-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search in these records..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 pl-8 pr-2 py-1 text-[10px] focus:outline-none"
                />
              </div>

              {/* Column visibility drop */}
              <div className="relative self-end">
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className="border border-neutral-200 hover:bg-neutral-50 px-2 py-1 flex items-center space-x-1 font-bold text-[9px] uppercase"
                  type="button"
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

            {/* Table Grid */}
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
                        onClick={() => onItemSelect(row.original)}
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
                        No records found matching current criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-[9px] uppercase font-bold text-neutral-500">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                  className="bg-neutral-50 border border-neutral-200 p-1 focus:outline-none font-bold"
                >
                  {[5, 10, 20].map(size => (
                    <option key={size} value={size}>{size} records</option>
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
                    type="button"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border border-neutral-200 hover:bg-neutral-50 px-2 py-1 disabled:opacity-50"
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Kanban Board layout */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {kanbanColumns.map(colStatus => {
              const columnItems = filteredList.filter(item => getKanbanColumnValue(item) === colStatus);
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
                      {columnItems.length}
                    </span>
                  </div>

                  {/* Cards stack */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {columnItems.length > 0 ? (
                      columnItems.map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className="cursor-grab active:cursor-grabbing hover:border-black transition-all"
                        >
                          {renderKanbanCard(item, () => onItemSelect(item))}
                        </div>
                      ))
                    ) : (
                      <div className="h-24 border border-dashed border-neutral-200 flex items-center justify-center text-center text-neutral-400 text-[9px] uppercase">
                        Drop items here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
