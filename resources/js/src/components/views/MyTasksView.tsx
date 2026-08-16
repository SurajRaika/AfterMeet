import React, { useState } from 'react';
import { User, Task, Enquiry, TaskCategory, LinkType } from '../../types/crm';
import { USERS, INITIAL_HR_EMPLOYEES } from '../../constants/initialData';

interface MyTasksViewProps {
  currentUser: User;
  personalTasks: Task[];
  tasks: Task[];
  enquiries: Enquiry[];
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTaskId: (id: string | null) => void;
  handleMarkComplete: (taskId: string) => void;
  handleCreateTask: (taskData: Omit<Task, 'id' | 'status' | 'comments' | 'watchers' | 'creator'>) => void;
  handleAssignTask: (taskId: string, assigneeName: string) => void;
}

export function MyTasksView({
  currentUser,
  personalTasks,
  tasks,
  enquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTaskId,
  handleMarkComplete,
  handleCreateTask,
  handleAssignTask,
}: MyTasksViewProps) {
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'assigned-by-me' | 'department-tasks'>('my-tasks');

  // Form State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Sales');
  const [assignType, setAssignType] = useState<'person' | 'department'>('person');
  const [assigneeName, setAssigneeName] = useState('Anyone');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [description, setDescription] = useState('');

  // Universal task category and linking
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Client Enquiry');
  const [linkType, setLinkType] = useState<LinkType>('No Link / Standalone');
  const [linkedRecordId, setLinkedRecordId] = useState('');

  // Sorter / Filter utilities
  const departmentsList = ['Sales', 'Costing', 'Logistics', 'Sampling', 'Compliance', 'HR', 'IT', 'Executive'];

  const categoriesList: TaskCategory[] = [
    'Client Enquiry',
    'Sampling',
    'Costing',
    'Logistics',
    'Compliance',
    'HR',
    'IT / Support',
    'Administrative',
    'General Operations',
    'Campaign / Outreach',
    'Finance',
    'Other',
  ];

  const linkTypesList: LinkType[] = [
    'No Link / Standalone',
    'Enquiry',
    'Employee',
    'Department',
    'Campaign',
    'Other business record',
  ];

  // Get users for a department
  const getDeptEmployees = (dept: string) => {
    return Object.values(USERS).filter(u => u.department === dept);
  };

  const currentDeptEmployees = getDeptEmployees(department);

  // List of all employees across directory
  const allEmployeesList = React.useMemo(() => {
    const list = Object.values(USERS).map(u => ({ id: u.id, name: u.name }));
    INITIAL_HR_EMPLOYEES.forEach(emp => {
      if (!list.some(item => item.name === emp.name)) {
        list.push({ id: emp.id, name: emp.name });
      }
    });
    return list;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalAssignee = assignType === 'department' ? 'Anyone' : assigneeName;

    // determine human readable name for linking
    let linkedRecordName = '';
    if (linkType === 'Enquiry') {
      linkedRecordName = enquiries.find(enq => enq.id === linkedRecordId)?.customerName || linkedRecordId;
    } else if (linkType === 'Employee') {
      linkedRecordName = allEmployeesList.find(emp => emp.id === linkedRecordId)?.name || linkedRecordId;
    } else if (linkType === 'Department') {
      linkedRecordName = `${linkedRecordId} Dept`;
    } else if (linkType === 'Campaign') {
      linkedRecordName = linkedRecordId;
    } else {
      linkedRecordName = linkedRecordId;
    }

    handleCreateTask({
      title,
      type: 'Action Item',
      assignee: finalAssignee,
      department,
      dueDate,
      priority,
      linkedRecord: linkedRecordId,
      parentEnquiryId: linkType === 'Enquiry' ? linkedRecordId : undefined,
      description,
      category: taskCategory,
      linkType,
      linkedRecordName
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setLinkedRecordId('');
    setIsCreatorOpen(false);
  };

  // Filter tasks
  const assignedByMeTasks = tasks.filter(t => t.creator === currentUser.name);
  const departmentTasks = tasks.filter(t => t.department === currentUser.department);

  const renderTaskRow = (task: Task) => {
    const isCompleted = task.status === 'Completed';
    return (
      <div key={task.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 gap-2 border-b">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className={`text-[8px] font-bold px-1.5 py-0.2 border ${
              isCompleted ? 'bg-neutral-100 text-neutral-400 border-neutral-200' : 'bg-neutral-900 text-white border-neutral-900'
            }`}>
              {task.status}
            </span>
            <span className="text-[8px] font-mono font-bold bg-neutral-100 text-neutral-600 px-1.5 py-0.2 border border-neutral-200">
              {task.department}
            </span>
            {task.category && (
              <span className="text-[8px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 border border-blue-200 rounded-none uppercase">
                🏷️ {task.category}
              </span>
            )}
            <span className="font-bold text-neutral-950 text-[11px]">{task.title}</span>
            <span className="text-neutral-400 text-[10px]">({task.id})</span>
          </div>

          <p className="text-neutral-500 text-[9px] leading-none">
            {task.linkType && task.linkType !== 'No Link / Standalone' ? (
              <>
                <span className="bg-neutral-150 text-neutral-700 px-1 font-semibold text-[8px] border mr-1">
                  Link: {task.linkType}
                </span>
                <strong
                  className="text-neutral-700 underline cursor-pointer mr-2"
                  onClick={() => {
                    if (task.linkType === 'Enquiry') {
                      setSelectedEnquiryId(task.linkedRecord);
                      setCurrentView('enquiry-detail');
                    } else if (task.linkType === 'Employee') {
                      setCurrentView('ops-hr');
                    }
                  }}
                >
                  {task.linkedRecordName || task.linkedRecord}
                </strong>
                &bull;{' '}
              </>
            ) : (
              <span className="bg-neutral-100 text-neutral-500 px-1 font-semibold text-[8px] border mr-2">
                Standalone Task
              </span>
            )}
            Assignee: <strong className="text-neutral-700">{task.assignee}</strong> &bull; Priority: <strong className="text-neutral-700">{task.priority}</strong> &bull; Due: {task.dueDate} &bull; Creator: <strong className="text-neutral-700">{task.creator || 'System'}</strong>
          </p>
          <p className="text-neutral-600 text-[10px] max-w-xl leading-relaxed mt-1">{task.description}</p>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
          {/* Department allocation action */}
          {task.assignee === 'Anyone' && currentUser.department === task.department && currentUser.isManager && (
            <div className="flex items-center bg-white border border-neutral-300 p-0.5">
              <select
                onChange={(e) => {
                  if (e.target.value !== '') {
                    handleAssignTask(task.id, e.target.value);
                  }
                }}
                className="bg-transparent text-[9px] text-neutral-800 font-bold focus:outline-none p-1"
                defaultValue=""
              >
                <option value="" disabled>Delegate Task...</option>
                {getDeptEmployees(currentUser.department).map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setActiveTaskId(task.id)}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-2.5 py-1 text-[9px] uppercase border border-neutral-300 transition-colors"
          >
            Chat ({task.comments ? task.comments.length : 0})
          </button>
          {!isCompleted && (
            <button
              onClick={() => handleMarkComplete(task.id)}
              className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-bold px-2 py-1 text-[9px] uppercase transition-colors"
            >
              Resolve
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header system */}
      <div className="border-b border-neutral-200 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Enterprise Task Hub</h1>
          <p className="text-neutral-500 text-[10px]">Global company-wide system for standalone tasks, department allocations, and client enquiries.</p>
        </div>
        <button
          onClick={() => setIsCreatorOpen(!isCreatorOpen)}
          className="bg-black hover:bg-neutral-850 text-white font-bold py-1 px-3 text-[10px] uppercase transition-colors shrink-0"
        >
          {isCreatorOpen ? '✕ Close Form' : '+ Create Universal Task'}
        </button>
      </div>

      {/* Task Creation Form */}
      {isCreatorOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-3 space-y-3">
          <div className="border-b pb-1.5 flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-tight">Create Universal Corporate Task</span>
            <span className="text-[8px] text-neutral-500 italic">
              {currentUser.isManager ? 'Manager credentials: Full allocation privileges enabled.' : 'Employee credentials: Open communication & department query mode.'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Onboard John Smith clerk"
                required
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none focus:border-neutral-900 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Department Scope</label>
              <select
                value={department}
                onChange={e => {
                  setDepartment(e.target.value);
                  const employees = getDeptEmployees(e.target.value);
                  setAssigneeName(employees[0]?.name || 'Anyone');
                }}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Task Category</label>
              <select
                value={taskCategory}
                onChange={e => setTaskCategory(e.target.value as TaskCategory)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Link Type</label>
              <select
                value={linkType}
                onChange={e => {
                  const val = e.target.value as LinkType;
                  setLinkType(val);
                  // set default record based on choice
                  if (val === 'Enquiry' && enquiries.length > 0) {
                    setLinkedRecordId(enquiries[0]?.id || '');
                  } else if (val === 'Employee' && allEmployeesList.length > 0) {
                    setLinkedRecordId(allEmployeesList[0]?.id || '');
                  } else if (val === 'Department') {
                    setLinkedRecordId('Sales');
                  } else {
                    setLinkedRecordId('');
                  }
                }}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                {linkTypesList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Related Record ID</label>
              {linkType === 'No Link / Standalone' ? (
                <input
                  type="text"
                  disabled
                  value="N/A (Standalone)"
                  className="w-full bg-neutral-100 border border-neutral-300 p-1 text-[11px] text-neutral-500"
                />
              ) : linkType === 'Enquiry' ? (
                <select
                  value={linkedRecordId}
                  onChange={e => setLinkedRecordId(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                >
                  {enquiries.map(enq => (
                    <option key={enq.id} value={enq.id}>{enq.id} &mdash; {enq.customerName}</option>
                  ))}
                </select>
              ) : linkType === 'Employee' ? (
                <select
                  value={linkedRecordId}
                  onChange={e => setLinkedRecordId(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                >
                  {allEmployeesList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              ) : linkType === 'Department' ? (
                <select
                  value={linkedRecordId}
                  onChange={e => setLinkedRecordId(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                >
                  {departmentsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Record ID or Campaign name"
                  value={linkedRecordId}
                  onChange={e => setLinkedRecordId(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Assign Mode</label>
              <select
                value={assignType}
                onChange={e => setAssignType(e.target.value as 'person' | 'department')}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                disabled={!currentUser.isManager}
              >
                <option value="person">Specific Employee</option>
                <option value="department">Anyone (Department Queue)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Assignee Name</label>
              {assignType === 'department' ? (
                <input
                  type="text"
                  disabled
                  value="Unassigned (Dept Queue)"
                  className="w-full bg-neutral-100 border border-neutral-300 p-1 text-[11px] text-neutral-500"
                />
              ) : (
                <select
                  value={assigneeName}
                  onChange={e => setAssigneeName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                  disabled={!currentUser.isManager}
                >
                  <option value="Anyone">Anyone</option>
                  {currentDeptEmployees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Description / Context Body</label>
              <textarea
                rows={1}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide exact task requirements..."
                className="w-full bg-white border border-neutral-300 p-1.5 text-[11px] focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold py-1 px-4 text-[10px] uppercase transition-colors"
            >
              {currentUser.isManager ? 'Assign Corporate Task' : 'Send Department Message Request'}
            </button>
          </div>
        </form>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 bg-white p-0.5">
        <button
          onClick={() => setActiveTab('my-tasks')}
          className={`px-3 py-1.5 text-[9px] font-bold uppercase transition-colors ${
            activeTab === 'my-tasks'
              ? 'bg-neutral-950 text-white'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          My Tasks ({personalTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned-by-me')}
          className={`px-3 py-1.5 text-[9px] font-bold uppercase transition-colors ${
            activeTab === 'assigned-by-me'
              ? 'bg-neutral-950 text-white'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          Assigned by Me ({assignedByMeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('department-tasks')}
          className={`px-3 py-1.5 text-[9px] font-bold uppercase transition-colors ${
            activeTab === 'department-tasks'
              ? 'bg-neutral-950 text-white'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          Department Tasks ({currentUser.department}) ({departmentTasks.length})
        </button>
      </div>

      {/* Task Content List */}
      <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
        {activeTab === 'my-tasks' && (
          personalTasks.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 italic text-[10px]">
              No active tasks assigned directly to you.
            </div>
          ) : (
            personalTasks.map(renderTaskRow)
          )
        )}

        {activeTab === 'assigned-by-me' && (
          assignedByMeTasks.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 italic text-[10px]">
              You have not assigned any tasks.
            </div>
          ) : (
            assignedByMeTasks.map(renderTaskRow)
          )
        )}

        {activeTab === 'department-tasks' && (
          departmentTasks.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 italic text-[10px]">
              No tasks currently registered for the {currentUser.department} department.
            </div>
          ) : (
            departmentTasks.map(renderTaskRow)
          )
        )}
      </div>
    </div>
  );
}
