import React, { useState, useMemo, useEffect } from 'react';
import { User, Task, HREmployee } from '../../types/crm';
import { ModuleDeskView, CustomView } from '../ModuleDeskView';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface OpsHRViewProps {
  currentUser: User;
  hrEmployees: HREmployee[];
  tasks: Task[];
  triggerToast: (msg: string) => void;
  handleCreateHREmployee: (empData: Omit<HREmployee, 'onboardingChecklist' | 'offboardingChecklist' | 'trainingModules' | 'documents' | 'attendanceRequests'>) => void;
  handleUpdateHREmployeeDetails: (employeeId: string, fields: Partial<Pick<HREmployee, 'role' | 'department' | 'email' | 'status' | 'notes'>>) => void;
  handleToggleHROnboardingCheck: (employeeId: string, taskText: string) => void;
  handleToggleHROffboardingCheck: (employeeId: string, taskText: string) => void;
  handleToggleHRTrainingCheck: (employeeId: string, moduleName: string) => void;
  handleUploadHRDocument: (employeeId: string, name: string, type: string) => void;
  handleCreateHRAttendanceRequest: (employeeId: string, type: string, startDate: string, endDate: string) => void;
  handleActionHRAttendanceRequest: (employeeId: string, requestId: string, status: 'Approved' | 'Rejected') => void;
  handleCreateTask: (taskData: any) => void;
  setActiveTaskId: (id: string | null) => void;
}

export function OpsHRView({
  currentUser,
  hrEmployees,
  tasks,
  triggerToast,
  handleCreateHREmployee,
  handleUpdateHREmployeeDetails,
  handleToggleHROnboardingCheck,
  handleToggleHROffboardingCheck,
  handleToggleHRTrainingCheck,
  handleUploadHRDocument,
  handleCreateHRAttendanceRequest,
  handleActionHRAttendanceRequest,
  handleCreateTask,
  setActiveTaskId,
}: OpsHRViewProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [activeSubTab, setActiveTab] = useState<'Overview' | 'Checklist' | 'Training' | 'Attendance' | 'Documents'>('Overview');

  // New Employee Form state
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('Sales');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Update Profile inputs
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Onboarding' | 'Offboarding'>('Onboarding');
  const [editNotes, setEditNotes] = useState('');

  // Leave Form inputs
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('2026-08-20');
  const [endDate, setEndDate] = useState('2026-08-21');

  // Standalone task inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-08-25');
  const [taskDesc, setTaskDesc] = useState('');

  // Upload inputs
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('ID Verification');

  const activeEmp = hrEmployees.find(e => e.id === selectedEmpId) || null;

  // Sync edits
  useEffect(() => {
    if (activeEmp) {
      setEditRole(activeEmp.role);
      setEditEmail(activeEmp.email);
      setEditStatus(activeEmp.status);
      setEditNotes(activeEmp.notes || '');
    }
  }, [activeEmp]);

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName || !newRole || !newEmail) {
      triggerToast('Please provide ID, Name, Role, and Email for the new employee.');
      return;
    }
    handleCreateHREmployee({
      id: newId,
      name: newName,
      role: newRole,
      department: newDept,
      email: newEmail,
      status: 'Onboarding',
      notes: newNotes,
    });
    setNewId('');
    setNewName('');
    setNewRole('');
    setNewEmail('');
    setNewNotes('');
    setIsCreatorOpen(false);
  };

  const handleUpdateProfile = () => {
    if (!activeEmp) return;
    handleUpdateHREmployeeDetails(activeEmp.id, {
      role: editRole,
      email: editEmail,
      status: editStatus,
      notes: editNotes,
    });
  };

  const handleDispatchHRTask = () => {
    if (!activeEmp || !taskTitle.trim() || !taskDesc.trim()) {
      triggerToast('Ensure task title and details are entered.');
      return;
    }
    handleCreateTask({
      title: taskTitle,
      type: 'Action Item',
      assignee: activeEmp.name,
      department: activeEmp.department,
      dueDate: taskDueDate,
      priority: 'Medium',
      linkedRecord: activeEmp.id,
      description: taskDesc,
      category: 'HR',
      linkType: 'Employee',
      linkedRecordName: activeEmp.name
    });
    setTaskTitle('');
    setTaskDesc('');
  };

  // Compute status summary metrics for stats cards
  const stats = useMemo(() => {
    return [
      {
        label: 'Active Crew Count',
        value: hrEmployees.filter(e => e.status === 'Active').length,
        subtext: 'Fully verified workforce'
      },
      {
        label: 'Onboarding Queue',
        value: hrEmployees.filter(e => e.status === 'Onboarding').length,
        subtext: 'Awaiting training & checklist completion',
        subtextColorClass: 'text-blue-600'
      },
      {
        label: 'Offboarding Cases',
        value: hrEmployees.filter(e => e.status === 'Offboarding').length,
        subtext: 'Asset collection in progress'
      },
      {
        label: 'Total Directory Records',
        value: hrEmployees.length,
        subtext: 'Complete database listings'
      }
    ];
  }, [hrEmployees]);

  // Column definitions
  const columns = useMemo<ColumnDef<HREmployee>[]>(() => [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'Employee ID',
      cell: info => <span className="font-mono font-bold text-neutral-900">{info.getValue() as string}</span>,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Full Name',
      cell: info => <span className="font-bold text-neutral-950">{info.getValue() as string}</span>,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Corporate Designation',
      cell: info => <span className="font-semibold text-neutral-800">{info.getValue() as string}</span>,
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      cell: info => <span className="font-bold uppercase text-neutral-600 text-[9px]">{info.getValue() as string}</span>,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Corporate Email',
      cell: info => <span className="text-neutral-500 font-mono">{info.getValue() as string}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Profile Status',
      cell: info => {
        const val = info.getValue() as string;
        let color = 'bg-neutral-100 text-neutral-700 border-neutral-200';
        if (val === 'Active') {
          color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        } else if (val === 'Onboarding') {
          color = 'bg-blue-50 text-blue-800 border-blue-200';
        } else if (val === 'Offboarding') {
          color = 'bg-amber-50 text-amber-800 border-amber-200';
        }
        return <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold border uppercase ${color}`}>{val}</span>;
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
                setSelectedEmpId(row.id);
                setActiveTab('Overview');
              }}
              className="bg-black hover:bg-neutral-800 text-white text-[9px] px-2.5 py-0.5 rounded-none uppercase font-bold"
              type="button"
            >
              Open Profile →
            </button>
          </div>
        );
      }
    }
  ], []);

  // Kanban view card renderer
  const renderKanbanCard = (item: HREmployee, onSelect: () => void) => {
    return (
      <div
        onClick={onSelect}
        className="bg-white border border-neutral-200 p-2.5 cursor-grab active:cursor-grabbing hover:border-black transition-all space-y-1.5 shadow-2xs relative"
      >
        <div className="flex justify-between items-start">
          <span className="font-mono font-bold text-neutral-400 text-[8px]">{item.id}</span>
          <span className="inline-block px-1 py-0.2 text-[7px] font-bold border uppercase bg-neutral-50 text-neutral-600 border-neutral-100">{item.department}</span>
        </div>

        <div>
          <strong className="block text-neutral-900 text-[11px] leading-tight font-black">{item.name}</strong>
          <span className="text-neutral-500 text-[9px] block">{item.role}</span>
        </div>

        <div className="text-[9px] border-t border-neutral-100 pt-1.5 font-mono text-[8px] text-neutral-400">
          Email: {item.email}
        </div>

        <div className="pt-2 flex flex-wrap gap-1 border-t border-neutral-100 items-center justify-between">
          <span className="text-[8px] font-bold uppercase text-neutral-500">{item.status}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="bg-neutral-950 text-white text-[7px] font-bold px-1.5 py-0.5 uppercase flex items-center space-x-0.5"
            type="button"
          >
            <span>Profile</span>
            <ArrowRight className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>
    );
  };

  // Custom views fields setup
  const fieldsForCustomView: { value: keyof HREmployee; label: string }[] = [
    { value: 'name', label: 'Full Name' },
    { value: 'role', label: 'Corporate Designation' },
    { value: 'department', label: 'Department' },
    { value: 'status', label: 'Profile Status' },
    { value: 'email', label: 'Corporate Email' }
  ];

  const defaultCustomViews: CustomView<HREmployee>[] = [
    {
      id: 'view-onboarding',
      name: 'Onboarding Mode',
      conditions: [{ field: 'status', operator: 'equals', value: 'Onboarding' }],
      isBuiltIn: true
    },
    {
      id: 'view-sales-dept',
      name: 'Sales Dept Personnel',
      conditions: [{ field: 'department', operator: 'equals', value: 'Sales' }],
      isBuiltIn: true
    }
  ];

  // Render list (Desk View)
  if (!selectedEmpId) {
    return (
      <div className="space-y-4">
        {/* Toggle form button container */}
        <div className="flex justify-end">
          {/* Creator popup modal can be controlled locally */}
        </div>

        <ModuleDeskView<HREmployee>
          title="HR Desk Tracking Directory"
          subtitle="Enterprise Personnel Directory managing onboarding checklist compliance, corporate training modules, and annual leaves."
          data={hrEmployees}
          columns={columns}
          kanbanColumns={['Onboarding', 'Active', 'Offboarding', 'Inactive']}
          getKanbanColumnValue={item => item.status}
          onUpdateStatus={async (id, newStatus) => {
            handleUpdateHREmployeeDetails(id, { status: newStatus as any });
            triggerToast(`Employee status updated to ${newStatus}`);
          }}
          renderKanbanCard={renderKanbanCard}
          localStorageKey="aftermeet_hr_custom_views"
          defaultCustomViews={defaultCustomViews}
          fieldsForCustomView={fieldsForCustomView}
          stats={stats}
          onAddClick={() => {
            setNewId(`EMP-${Math.floor(Math.random() * 900) + 100}`);
            setNewName('');
            setNewRole('');
            setNewEmail('');
            setNewNotes('');
            setIsCreatorOpen(true);
          }}
          addButtonLabel="Add Employee Profile"
          onItemSelect={(item) => {
            setSelectedEmpId(item.id);
            setActiveTab('Overview');
          }}
          globalSearchFields={['id', 'name', 'role', 'department', 'email', 'status']}
        />

        {/* Create employee form rendering if open */}
        {isCreatorOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-neutral-350 max-w-md w-full p-4 space-y-4 shadow-xl text-[10px]">
              <div className="border-b pb-2 flex justify-between items-center">
                <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-900">Add New Outreach Lead</span>
                <button
                  type="button"
                  onClick={() => setIsCreatorOpen(false)}
                  className="text-neutral-400 hover:text-black font-black text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Employee ID *</label>
                  <input
                    type="text"
                    value={newId}
                    onChange={e => setNewId(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-neutral-500 block">Designation Role *</label>
                    <input
                      type="text"
                      placeholder="e.g. IT Analyst"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      required
                      className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-neutral-500 block">Department *</label>
                    <select
                      value={newDept}
                      onChange={e => setNewDept(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none text-[11px] font-bold"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Costing">Costing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Sampling">Sampling</option>
                      <option value="Compliance">Compliance</option>
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Corporate Email *</label>
                  <input
                    type="email"
                    placeholder="jane.doe@tradedesk.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-500 block">Bio / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Onboarding background details..."
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-1.5 focus:outline-none focus:border-black text-[11px]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatorOpen(false)}
                    className="border border-neutral-300 hover:bg-neutral-100 py-1 px-3 uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-4 uppercase"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render detailed workspace (Detail View)
  if (!activeEmp) return null;

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setSelectedEmpId('')}
          className="flex items-center space-x-1 text-neutral-600 hover:text-black font-bold uppercase text-[10px]"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to HR Directory</span>
        </button>
      </div>

      {/* Header Profile Info Block */}
      <div className="border-b pb-3 flex justify-between items-start bg-white border border-neutral-200 p-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-neutral-900 text-white flex items-center justify-center font-bold text-[13px]">
            {activeEmp.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-950 uppercase">{activeEmp.name} &bull; {activeEmp.id}</h3>
            <p className="text-neutral-500 text-[10px]">
              Role: <strong className="text-neutral-700">{activeEmp.role}</strong> &bull; Department: <strong className="text-neutral-700">{activeEmp.department}</strong>
            </p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[8px] font-bold font-mono border uppercase ${
          activeEmp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {activeEmp.status}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5 overflow-x-auto">
        {(['Overview', 'Checklist', 'Training', 'Attendance', 'Documents'] as const).map((tab) => (
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

      {/* Active viewport */}
      <div className="p-4 border bg-white min-h-[350px] text-[10px] space-y-4">

        {/* OVERVIEW */}
        {activeSubTab === 'Overview' && (
          <div className="space-y-4">
            <div className="bg-neutral-50 border p-3 space-y-3">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Edit Personnel Profile Record</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Corporate Role</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Corporate Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Profile Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                  >
                    <option value="Onboarding">Onboarding</option>
                    <option value="Active">Active</option>
                    <option value="Offboarding">Offboarding</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">HR Officer Notes</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleUpdateProfile}
                  className="bg-neutral-900 hover:bg-neutral-850 text-white uppercase text-[8px] px-3 py-1 font-bold"
                  type="button"
                >
                  ✓ Save Profile Changes
                </button>
              </div>
            </div>

            {/* HR Standalone Tasks Dispatch */}
            <div className="bg-neutral-50 border p-3 space-y-3">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Dispatch global standalone HR task for {activeEmp.name}</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Task Title</label>
                  <input
                    type="text"
                    placeholder="Complete safety walkthrough"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Task Description</label>
                  <input
                    type="text"
                    placeholder="Detailed requirements..."
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    className="bg-white border p-1 text-[10px] w-full focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleDispatchHRTask}
                className="bg-neutral-900 hover:bg-neutral-850 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                + Create Standalone HR Task
              </button>
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {activeSubTab === 'Checklist' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Onboarding / Offboarding checklist</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Onboarding */}
              <div className="space-y-1.5">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Onboarding checklist ({activeEmp.onboardingChecklist.length})</span>
                {activeEmp.onboardingChecklist.length === 0 ? (
                  <p className="text-neutral-400 italic">No onboarding tasks defined.</p>
                ) : (
                  activeEmp.onboardingChecklist.map((item, idx) => (
                    <label key={idx} className="flex items-center space-x-2 p-1.5 border bg-white cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleHROnboardingCheck(activeEmp.id, item.task)}
                        className="h-3 w-3"
                      />
                      <span className={`text-[10px] ${item.completed ? 'line-through text-neutral-400' : 'text-neutral-850 font-semibold'}`}>{item.task}</span>
                    </label>
                  ))
                )}
              </div>

              {/* Offboarding */}
              <div className="space-y-1.5">
                <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-tight block">Offboarding checklist ({activeEmp.offboardingChecklist.length})</span>
                {activeEmp.offboardingChecklist.length === 0 ? (
                  <p className="text-neutral-400 italic">No offboarding tasks defined.</p>
                ) : (
                  activeEmp.offboardingChecklist.map((item, idx) => (
                    <label key={idx} className="flex items-center space-x-2 p-1.5 border bg-white cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleHROffboardingCheck(activeEmp.id, item.task)}
                        className="h-3 w-3"
                      />
                      <span className={`text-[10px] ${item.completed ? 'line-through text-neutral-400' : 'text-neutral-850 font-semibold'}`}>{item.task}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRAINING */}
        {activeSubTab === 'Training' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Required compliance & leadership courses</span>
            <div className="space-y-1.5">
              {activeEmp.trainingModules.map((item, idx) => (
                <label key={idx} className="flex justify-between items-center p-2 border bg-white cursor-pointer hover:bg-neutral-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleHRTrainingCheck(activeEmp.id, item.name)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="font-bold text-neutral-900">{item.name}</span>
                  </div>
                  {item.completed && (
                    <span className="text-[8px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 font-bold font-mono uppercase">
                      Passed {item.date}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ATTENDANCE */}
        {activeSubTab === 'Attendance' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Annual leave & medical request logs</span>

            <div className="space-y-1.5">
              {activeEmp.attendanceRequests.length === 0 ? (
                <p className="text-neutral-400 italic text-center py-2 text-[9px]">No attendance requests recorded.</p>
              ) : (
                activeEmp.attendanceRequests.map(req => (
                  <div key={req.id} className="p-2 border bg-white flex justify-between items-center text-[9px]">
                    <div>
                      <strong className="text-neutral-900">{req.type}</strong>
                      <span className="text-neutral-500 block">Dates: {req.startDate} to {req.endDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleActionHRAttendanceRequest(activeEmp.id, req.id, 'Approved')}
                            className="bg-emerald-600 text-white font-bold uppercase text-[7px] px-2 py-0.5"
                            type="button"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleActionHRAttendanceRequest(activeEmp.id, req.id, 'Rejected')}
                            className="bg-red-600 text-white font-bold uppercase text-[7px] px-2 py-0.5"
                            type="button"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-1.5 py-0.2 font-mono uppercase font-bold border ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Lodge New leave request */}
            <div className="bg-white p-3 border text-[10px] space-y-2">
              <span className="font-bold uppercase text-[8px] text-neutral-400 block">Request leave / Medical attendance</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    className="bg-neutral-50 border p-1 text-[10px] w-full focus:outline-none font-medium"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave / Medical</option>
                    <option value="Sabbatical">Corporate Sabbatical</option>
                    <option value="Maternity / Paternity">Maternity/Paternity</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-neutral-50 border p-1 text-[10px] w-full focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-neutral-50 border p-1 text-[10px] w-full focus:outline-none font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => handleCreateHRAttendanceRequest(activeEmp.id, leaveType, startDate, endDate)}
                className="bg-neutral-900 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                + Lodge Leave Request
              </button>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {activeSubTab === 'Documents' && (
          <div className="bg-neutral-50 border p-3 space-y-3">
            <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Signed HR Agreements & Identification Records ({activeEmp.documents.length})</span>
            {activeEmp.documents.length === 0 ? (
              <p className="text-neutral-400 italic">No files on record.</p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {activeEmp.documents.map(doc => (
                  <div key={doc.id} className="p-1.5 border bg-white flex justify-between items-center">
                    <div>
                      <strong className="text-neutral-900">{doc.name}</strong>
                      <span className="text-neutral-400 text-[8px] block">Uploaded on {doc.date} &bull; Category: {doc.type}</span>
                    </div>
                    <span className="text-neutral-500 font-mono text-[9px]">{doc.id}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white p-3 border text-[10px] space-y-2">
              <span className="font-bold uppercase text-[8px] text-neutral-400 block font-mono">Upload HR Document Record</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Document File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Passport_Scan.pdf"
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    className="bg-neutral-50 border p-1 text-[10px] w-full focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[8px] block uppercase font-bold mb-0.5">Document Type</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="bg-neutral-50 border p-1 text-[10px] w-full focus:outline-none"
                  >
                    <option value="ID Verification">ID Verification</option>
                    <option value="Employment Agreement">Employment Agreement</option>
                    <option value="Medical Clearance">Medical Clearance</option>
                    <option value="Annual Performance Review">Annual Performance Review</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!docName.trim()) return;
                  handleUploadHRDocument(activeEmp.id, docName, docType);
                  setDocName('');
                }}
                className="bg-neutral-900 text-white uppercase text-[8px] px-3 py-1 font-bold"
                type="button"
              >
                ✓ Attach HR Document
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
