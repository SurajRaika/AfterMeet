import React, { useState, useMemo } from 'react';
import { User, Expense, Enquiry, Task, ExpenseComment } from '../../types/crm';

interface SpendManagementViewProps {
  currentUser: User;
  expenses: Expense[];
  enquiries: Enquiry[];
  tasks: Task[];
  currentSubView: 'overview' | 'requests' | 'claims' | 'my-expenses' | 'approvals' | 'accounting';
  setCurrentView: (view: string) => void;
  setSelectedEnquiryId: (id: string) => void;
  setActiveTaskId: (id: string | null) => void;
  handleCreateExpense: (expenseData: any) => void;
  handleUpdateExpenseStatus: (expenseId: string, status: Expense['status'], logMsg?: string) => void;
  handleAddExpenseComment: (expenseId: string, text: string) => void;
  handleUpdateAccountingDetails: (expenseId: string, details: any) => void;
}

export function SpendManagementView({
  currentUser,
  expenses,
  enquiries,
  tasks,
  currentSubView,
  setCurrentView,
  setSelectedEnquiryId,
  setActiveTaskId,
  handleCreateExpense,
  handleUpdateExpenseStatus,
  handleAddExpenseComment,
  handleUpdateAccountingDetails,
}: SpendManagementViewProps) {
  // Drawer state for expense detailed inspect
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Form states for adding new expenses
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'request' | 'claim'>('request');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formCurrency, setFormCurrency] = useState('₹');
  const [formCategory, setFormCategory] = useState('Software');
  const [formDescription, setFormDescription] = useState('');
  const [formDepartment, setFormDepartment] = useState(currentUser.department === 'Executive' || currentUser.department === 'Accounting' ? 'Sales' : currentUser.department);
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurrenceDetails, setFormRecurrenceDetails] = useState('Monthly');
  const [formAttachment, setFormAttachment] = useState('');
  const [formEnquiryId, setFormEnquiryId] = useState('');
  const [formTaskId, setFormTaskId] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Credit Card');
  const [formNotes, setFormNotes] = useState('');

  // Accounting update inputs
  const [accPayee, setAccPayee] = useState('');
  const [accNotes, setAccNotes] = useState('');
  const [accReimbursable, setAccReimbursable] = useState<number>(0);

  // Filters for Accounting Dashboard
  const [filterDept, setFilterDept] = useState('All');
  const [filterEmployee, setFilterEmployee] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterAmount, setFilterAmount] = useState('');

  // Sub-tab for Accounting Queue
  const [accSubTab, setAccSubTab] = useState<'all' | 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'>('all');

  // Computed data lists
  const activeExpense = useMemo(() => {
    return expenses.find(e => e.id === selectedExpenseId) || null;
  }, [expenses, selectedExpenseId]);

  // Sync Accounting form when active expense changes
  React.useEffect(() => {
    if (activeExpense) {
      setAccPayee(activeExpense.vendorPayee || '');
      setAccNotes(activeExpense.accountingNotes || '');
      setAccReimbursable(activeExpense.reimbursableAmount || activeExpense.amount);
    }
  }, [activeExpense]);

  // Standard drop options
  const departments = ['Sales', 'Costing', 'Logistics', 'Sampling', 'Compliance', 'HR', 'IT', 'Accounting', 'Executive'];
  const categories = ['Software', 'Travel / Client Entertainment', 'Transportation', 'Office Supplies', 'Hardware', 'Professional Services', 'Other'];

  // Total Summary stats
  const totals = useMemo(() => {
    let pending = 0;
    let pendingApprovals = 0;
    let pendingAccounting = 0;
    let approved = 0;
    let paid = 0;
    let outstanding = 0;

    expenses.forEach(e => {
      if (e.status === 'Pending Approval') {
        pendingApprovals += e.amount;
      }
      if (e.status === 'Sent to Accounting' || e.status === 'Processing') {
        pendingAccounting += e.amount;
      }
      if (e.status === 'Approved' || e.status === 'Sent to Accounting' || e.status === 'Processing') {
        approved += e.amount;
        outstanding += e.amount;
      }
      if (e.status === 'Paid' || e.status === 'Purchased/Paid' || e.status === 'Completed') {
        paid += e.amount;
      }
      if (e.status !== 'Completed' && e.status !== 'Paid' && e.status !== 'Purchased/Paid' && e.status !== 'Rejected') {
        pending += e.amount;
      }
    });

    return { pending, pendingApprovals, pendingAccounting, approved, paid, outstanding };
  }, [expenses]);

  // Department / Category Breakdown
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.department] = (map[e.department] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const employeeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.requestedBy] = (map[e.requestedBy] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  // Check if current user is Department Head for a given expense
  const canApprove = (exp: Expense) => {
    if (currentUser.isPresident || currentUser.isAdmin) return true;
    if (!currentUser.isManager) return false;

    // User is Department Head, must match the expense department, and must not be their own expense
    return currentUser.department === exp.department && currentUser.name !== exp.requestedBy;
  };

  // Submit Expense Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || formAmount <= 0) return;

    handleCreateExpense({
      expense_type: formType,
      title: formTitle,
      amount: formAmount,
      currency: formCurrency,
      category: formCategory,
      description: formDescription,
      department: formDepartment,
      requestedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0]!,
      recurring: formType === 'request' ? formRecurring : undefined,
      recurrenceDetails: formType === 'request' && formRecurring ? formRecurrenceDetails : undefined,
      attachment: formAttachment || undefined,
      enquiryId: formEnquiryId || undefined,
      taskId: formTaskId || undefined,
      paymentMethod: formType === 'claim' ? formPaymentMethod : undefined,
      notes: formNotes || undefined,
      status: 'Submitted'
    });

    // Reset Form
    setFormTitle('');
    setFormAmount(0);
    setFormDescription('');
    setFormAttachment('');
    setFormEnquiryId('');
    setFormTaskId('');
    setFormNotes('');
    setIsFormOpen(false);
  };

  // Filter & Search Main Expenses List
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filterDept !== 'All' && e.department !== filterDept) return false;
      if (filterEmployee !== 'All' && e.requestedBy !== filterEmployee) return false;
      if (filterCategory !== 'All' && e.category !== filterCategory) return false;
      if (filterStatus !== 'All' && e.status !== filterStatus) return false;
      if (filterDate && !e.date.includes(filterDate)) return false;
      if (filterAmount && e.amount < parseFloat(filterAmount)) return false;
      return true;
    });
  }, [expenses, filterDept, filterEmployee, filterCategory, filterStatus, filterDate, filterAmount]);

  // Accounting specific filter views
  const accountingFilteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // Must be Approved or later in cycle, unless standard employee submitted
      if (e.status === 'Draft' || e.status === 'Submitted' || e.status === 'Pending Approval' || e.status === 'Changes Requested') {
        return false;
      }

      if (accSubTab === 'pending' && e.status !== 'Approved' && e.status !== 'Sent to Accounting') return false;
      if (accSubTab === 'approved' && e.status !== 'Approved') return false;
      if (accSubTab === 'processing' && e.status !== 'Processing') return false;
      if (accSubTab === 'paid' && e.status !== 'Paid' && e.status !== 'Purchased/Paid' && e.status !== 'Completed') return false;
      if (accSubTab === 'rejected' && e.status !== 'Rejected') return false;

      return true;
    });
  }, [expenses, accSubTab]);

  // Approvals specific filter views
  const pendingApprovalsExpenses = useMemo(() => {
    return expenses.filter(e => {
      return (e.status === 'Submitted' || e.status === 'Pending Approval') && canApprove(e);
    });
  }, [expenses, currentUser]);

  // My Personal Expenses
  const myExpensesStats = useMemo(() => {
    const myItems = expenses.filter(e => e.requestedBy === currentUser.name);
    let requested = 0;
    let approved = 0;
    let reimbursed = 0;

    myItems.forEach(e => {
      requested += e.amount;
      if (e.status !== 'Rejected' && e.status !== 'Draft' && e.status !== 'Submitted' && e.status !== 'Pending Approval' && e.status !== 'Changes Requested') {
        approved += e.amount;
      }
      if (e.status === 'Paid' || e.status === 'Completed' || e.status === 'Purchased/Paid') {
        reimbursed += e.amount;
      }
    });

    return { myItems, requested, approved, reimbursed };
  }, [expenses, currentUser]);

  return (
    <div className="space-y-4">
      {/* Module Title Bar */}
      <div className="bg-white border border-neutral-200 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase font-mono tracking-wider">Enterprise Finance Desk</span>
          <h1 className="text-sm font-black text-neutral-900 uppercase tracking-tight mt-1">Spend Management System</h1>
          <p className="text-neutral-500 text-[10px]">Track expense claims, subscription purchase requests, departmental workloads, and global balances.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormType('request');
              setIsFormOpen(true);
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-1 px-3 text-[10px] uppercase transition-colors"
          >
            + New Expense Request
          </button>
          <button
            onClick={() => {
              setFormType('claim');
              setIsFormOpen(true);
            }}
            className="bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 font-bold py-1 px-3 text-[10px] uppercase transition-colors"
          >
            + Submit Expense Claim
          </button>
        </div>
      </div>

      {/* Expense Creator Modal/Form block */}
      {isFormOpen && (
        <form onSubmit={handleSubmitForm} className="bg-white border border-neutral-200 p-4 space-y-3.5 shadow-sm">
          <div className="flex justify-between items-center border-b pb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-850">
              Create New {formType === 'request' ? 'Expense Purchase Request' : 'Incurred Expense Claim'}
            </span>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-neutral-400 hover:text-neutral-900 font-bold">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Expense Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder={formType === 'request' ? 'e.g. Need CRM Subscription' : 'e.g. Client lunch with John Sterling'}
                required
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Amount</label>
              <input
                type="number"
                value={formAmount}
                onChange={e => setFormAmount(parseFloat(e.target.value) || 0)}
                placeholder="₹ Amount"
                required
                min="1"
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Currency</label>
              <select
                value={formCurrency}
                onChange={e => setFormCurrency(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                <option value="₹">₹ INR</option>
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Category</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Charging Department</label>
              <select
                value={formDepartment}
                onChange={e => setFormDepartment(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {formType === 'request' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-bold text-neutral-400 block">Recurring Expense?</label>
                  <select
                    value={formRecurring ? 'yes' : 'no'}
                    onChange={e => setFormRecurring(e.target.value === 'yes')}
                    className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                  >
                    <option value="no">No, One-time</option>
                    <option value="yes">Yes, Recurring</option>
                  </select>
                </div>
                {formRecurring && (
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-neutral-400 block">Recurrence details</label>
                    <input
                      type="text"
                      value={formRecurrenceDetails}
                      onChange={e => setFormRecurrenceDetails(e.target.value)}
                      placeholder="e.g. Monthly, Quarterly"
                      className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-bold text-neutral-400 block">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={e => setFormPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                  >
                    <option value="Credit Card">Corporate / Personal Credit Card</option>
                    <option value="Cash">Cash Outlay</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-bold text-neutral-400 block">Receipt reference / notes</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="e.g. Bill reference code"
                    className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Attachment / Quotation file (optional)</label>
              <input
                type="text"
                value={formAttachment}
                onChange={e => setFormAttachment(e.target.value)}
                placeholder="e.g. quote.pdf or receipt.jpg"
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Related active Deal / Enquiry (optional)</label>
              <select
                value={formEnquiryId}
                onChange={e => setFormEnquiryId(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                <option value="">No Linked Enquiry</option>
                {enquiries.map(enq => (
                  <option key={enq.id} value={enq.id}>{enq.id} - {enq.customerName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block">Related Task (optional)</label>
              <select
                value={formTaskId}
                onChange={e => setFormTaskId(e.target.value)}
                className="w-full bg-white border border-neutral-300 p-1 text-[11px] focus:outline-none"
              >
                <option value="">No Linked Task</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.id} - {t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold text-neutral-400 block">Description / Reason Context</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Provide clean justification for the purchase or outlay..."
              className="w-full bg-white border border-neutral-300 p-1.5 text-[11px] focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-neutral-950 hover:bg-neutral-900 text-white uppercase text-[9px] px-3.5 py-1.5 font-bold"
            >
              ✓ Submit and Dispatch
            </button>
          </div>
        </form>
      )}

      {/* VIEW 1: OVERVIEW & DASHBOARD */}
      {currentSubView === 'overview' && (
        <div className="space-y-4">
          {/* Accounting Head Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Pending Amount</span>
              <strong className="text-sm font-black tracking-tight text-neutral-900">₹{totals.pending.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Pending Manager Approval</span>
              <strong className="text-sm font-black tracking-tight text-neutral-900">₹{totals.pendingApprovals.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Pending Accounting verification</span>
              <strong className="text-sm font-black tracking-tight text-neutral-900">₹{totals.pendingAccounting.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Total Approved</span>
              <strong className="text-sm font-black tracking-tight text-neutral-900">₹{totals.approved.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Total Disbursed / Paid</span>
              <strong className="text-sm font-black tracking-tight text-emerald-700">₹{totals.paid.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Outstanding Payables</span>
              <strong className="text-sm font-black tracking-tight text-amber-700">₹{totals.outstanding.toLocaleString()}</strong>
            </div>
          </div>

          {/* Filtering controls for analytical logs */}
          <div className="bg-white border p-3 space-y-2">
            <span className="font-bold text-[9px] text-neutral-400 uppercase tracking-wider block">Advanced Records Filter Panel</span>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div>
                <label className="text-[8px] text-neutral-400 font-bold uppercase block mb-0.5">Department</label>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full bg-white border p-1 text-[10px] focus:outline-none">
                  <option value="All">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 font-bold uppercase block mb-0.5">Employee</label>
                <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="w-full bg-white border p-1 text-[10px] focus:outline-none">
                  <option value="All">All Employees</option>
                  {Array.from(new Set(expenses.map(e => e.requestedBy))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 font-bold uppercase block mb-0.5">Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-white border p-1 text-[10px] focus:outline-none">
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 font-bold uppercase block mb-0.5">Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-white border p-1 text-[10px] focus:outline-none">
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent to Accounting">Sent to Accounting</option>
                  <option value="Processing">Processing</option>
                  <option value="Paid">Paid</option>
                  <option value="Purchased/Paid">Purchased/Paid</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Changes Requested">Changes Requested</option>
                </select>
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 font-bold uppercase block mb-0.5">Date</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full bg-white border p-1 text-[10px] focus:outline-none font-mono" />
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 font-bold uppercase block mb-0.5">Amount &gt;=</label>
                <input type="number" value={filterAmount} onChange={e => setFilterAmount(e.target.value)} placeholder="Minimum Amount" className="w-full bg-white border p-1 text-[10px] focus:outline-none font-mono" />
              </div>
            </div>
          </div>

          {/* Graphical representation / Table rows breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border p-3.5 space-y-2">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Expenses By Department</span>
              <div className="space-y-1.5 text-[10px]">
                {Object.entries(departmentBreakdown).map(([dept, val]) => (
                  <div key={dept} className="flex justify-between items-center p-1 border-b">
                    <strong>{dept}</strong>
                    <span className="font-mono">₹{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border p-3.5 space-y-2">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Expenses By Category</span>
              <div className="space-y-1.5 text-[10px]">
                {Object.entries(categoryBreakdown).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between items-center p-1 border-b">
                    <strong>{cat}</strong>
                    <span className="font-mono">₹{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border p-3.5 space-y-2">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1">Spend By Employee</span>
              <div className="space-y-1.5 text-[10px]">
                {Object.entries(employeeBreakdown).map(([emp, val]) => (
                  <div key={emp} className="flex justify-between items-center p-1 border-b">
                    <strong>{emp}</strong>
                    <span className="font-mono">₹{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Master Logs Table */}
          <div className="bg-white border">
            <div className="p-3 border-b flex justify-between items-center bg-neutral-50">
              <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400">Filtered Master Expense Records ({filteredExpenses.length})</span>
            </div>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 italic text-[10px]">No expenses match current query filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 border-b">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Requested By</th>
                      <th className="p-2.5">Dept</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredExpenses.map(e => (
                      <tr key={e.id} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-mono font-bold text-neutral-500">{e.id}</td>
                        <td className="p-2.5 uppercase font-bold text-[9px]">
                          {e.expense_type === 'request' ? (
                            <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2">Request</span>
                          ) : (
                            <span className="text-orange-700 bg-orange-50 border border-orange-200 px-1 py-0.2">Claim</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-neutral-900">{e.title}</td>
                        <td className="p-2.5">{e.requestedBy}</td>
                        <td className="p-2.5 font-mono">{e.department}</td>
                        <td className="p-2.5">{e.category}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{e.currency}{e.amount.toLocaleString()}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.2 text-[8px] uppercase font-bold border ${
                            e.status === 'Completed' || e.status === 'Paid' || e.status === 'Purchased/Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : e.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-neutral-900 text-white border-neutral-900'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => setSelectedExpenseId(e.id)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-2 py-1 uppercase text-[8px] border"
                          >
                            Inspect & Timeline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: EXPENSE REQUESTS ONLY */}
      {currentSubView === 'requests' && (
        <div className="bg-white border">
          <div className="p-3 border-b bg-neutral-50 font-bold text-[9px] uppercase tracking-wider text-neutral-400">
            Active Employee Expense Requests (Need company to purchase)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="bg-neutral-100 border-b">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Requested By</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Amount</th>
                  <th className="p-2.5">Recurring</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.filter(e => e.expense_type === 'request').map(e => (
                  <tr key={e.id} className="hover:bg-neutral-50">
                    <td className="p-2.5 font-mono font-bold text-neutral-500">{e.id}</td>
                    <td className="p-2.5 font-bold text-neutral-900">
                      {e.title}
                      {e.enquiryId && <span className="block text-[8px] text-neutral-400 font-normal">Enquiry: {e.enquiryId}</span>}
                    </td>
                    <td className="p-2.5">{e.requestedBy}</td>
                    <td className="p-2.5">{e.category}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{e.currency}{e.amount.toLocaleString()}</td>
                    <td className="p-2.5">{e.recurring ? `Yes (${e.recurrenceDetails || 'Monthly'})` : 'No'}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.2 text-[8px] uppercase font-bold border ${
                        e.status === 'Completed' || e.status === 'Purchased/Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-950 text-white'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setSelectedExpenseId(e.id)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-850 font-bold px-2 py-1 text-[8px] uppercase border"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: EXPENSE CLAIMS ONLY */}
      {currentSubView === 'claims' && (
        <div className="bg-white border">
          <div className="p-3 border-b bg-neutral-50 font-bold text-[9px] uppercase tracking-wider text-neutral-400">
            Active Employee Expense Claims (Already spent / Reimbursable)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="bg-neutral-100 border-b">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Requested By</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Amount</th>
                  <th className="p-2.5">Payment Method</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.filter(e => e.expense_type === 'claim').map(e => (
                  <tr key={e.id} className="hover:bg-neutral-50">
                    <td className="p-2.5 font-mono font-bold text-neutral-500">{e.id}</td>
                    <td className="p-2.5 font-bold text-neutral-900">
                      {e.title}
                      {e.attachment && <span className="block text-[8px] text-blue-600 font-normal">📎 {e.attachment}</span>}
                    </td>
                    <td className="p-2.5">{e.requestedBy}</td>
                    <td className="p-2.5">{e.category}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{e.currency}{e.amount.toLocaleString()}</td>
                    <td className="p-2.5">{e.paymentMethod || 'Credit Card'}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.2 text-[8px] uppercase font-bold border ${
                        e.status === 'Completed' || e.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-950 text-white'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setSelectedExpenseId(e.id)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-850 font-bold px-2 py-1 text-[8px] uppercase border"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: MY PERSONAL EXPENSES */}
      {currentSubView === 'my-expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">My Expense Submissions</span>
              <strong className="text-sm font-black text-neutral-900">{myExpensesStats.myItems.length} logs</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Total Requested</span>
              <strong className="text-sm font-black text-neutral-900">₹{myExpensesStats.requested.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Total Approved</span>
              <strong className="text-sm font-black text-neutral-900">₹{myExpensesStats.approved.toLocaleString()}</strong>
            </div>
            <div className="bg-white border p-3">
              <span className="text-[8px] text-neutral-400 font-bold block uppercase">Total Reimbursed</span>
              <strong className="text-sm font-black text-emerald-700">₹{myExpensesStats.reimbursed.toLocaleString()}</strong>
            </div>
          </div>

          <div className="bg-white border">
            <div className="p-3 border-b bg-neutral-50 font-bold text-[9px] uppercase tracking-wider text-neutral-400">
              My Expenses History & Tracking
            </div>
            {myExpensesStats.myItems.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 italic">You have not submitted any expenses yet. Use buttons above to submit.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="bg-neutral-100 border-b">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {myExpensesStats.myItems.map(e => (
                      <tr key={e.id} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-mono font-bold text-neutral-500">{e.id}</td>
                        <td className="p-2.5 uppercase font-bold text-[8px]">
                          {e.expense_type === 'request' ? (
                            <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2">Request</span>
                          ) : (
                            <span className="text-orange-700 bg-orange-50 border border-orange-200 px-1 py-0.2">Claim</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-neutral-900">{e.title}</td>
                        <td className="p-2.5">{e.category}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{e.currency}{e.amount.toLocaleString()}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.2 text-[8px] uppercase font-bold border ${
                            e.status === 'Completed' || e.status === 'Paid' || e.status === 'Purchased/Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-950 text-white'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => setSelectedExpenseId(e.id)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-850 font-bold px-2 py-1 text-[8px] uppercase border"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: MANAGER APPROVALS QUEUE */}
      {currentSubView === 'approvals' && (
        <div className="bg-white border">
          <div className="p-3 border-b bg-neutral-50 font-bold text-[9px] uppercase tracking-wider text-neutral-400">
            Pending Department Manager Approvals Worklist ({pendingApprovalsExpenses.length})
          </div>
          {pendingApprovalsExpenses.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 italic text-[10px]">
              No outstanding employee requests require your department head approval at this time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="bg-neutral-100 border-b">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Employee</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5">References</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingApprovalsExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-neutral-50">
                      <td className="p-2.5 font-mono font-bold text-neutral-500">{e.id}</td>
                      <td className="p-2.5 font-bold">{e.requestedBy} ({e.department})</td>
                      <td className="p-2.5">{e.title}</td>
                      <td className="p-2.5">{e.category}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{e.currency}{e.amount.toLocaleString()}</td>
                      <td className="p-2.5 font-medium text-[8px]">
                        {e.enquiryId && <span className="bg-neutral-100 border p-1 mr-1">Enquiry: {e.enquiryId}</span>}
                        {e.taskId && <span className="bg-neutral-100 border p-1">Task: {e.taskId}</span>}
                        {!e.enquiryId && !e.taskId && <span className="text-neutral-400 italic">None</span>}
                      </td>
                      <td className="p-2.5 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateExpenseStatus(e.id, 'Sent to Accounting', `Approved by Manager (${currentUser.name})`)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateExpenseStatus(e.id, 'Rejected', `Rejected by Manager (${currentUser.name})`)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateExpenseStatus(e.id, 'Changes Requested', `Changes requested by Manager (${currentUser.name})`)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                        >
                          Request Changes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 6: ACCOUNTING DESK WORKSPACE */}
      {currentSubView === 'accounting' && (
        <div className="space-y-4">
          <div className="flex border-b bg-white p-0.5">
            {(['all', 'pending', 'approved', 'processing', 'paid', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setAccSubTab(tab)}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase transition-colors ${
                  accSubTab === tab ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {tab} ({
                  expenses.filter(e => {
                    if (e.status === 'Draft' || e.status === 'Submitted' || e.status === 'Pending Approval' || e.status === 'Changes Requested') return false;
                    if (tab === 'pending' && e.status !== 'Approved' && e.status !== 'Sent to Accounting') return false;
                    if (tab === 'approved' && e.status !== 'Approved') return false;
                    if (tab === 'processing' && e.status !== 'Processing') return false;
                    if (tab === 'paid' && e.status !== 'Paid' && e.status !== 'Purchased/Paid' && e.status !== 'Completed') return false;
                    if (tab === 'rejected' && e.status !== 'Rejected') return false;
                    return true;
                  }).length
                })
              </button>
            ))}
          </div>

          <div className="bg-white border">
            <div className="p-3 border-b bg-neutral-50 font-bold text-[9px] uppercase tracking-wider text-neutral-400">
              Approved Expense Ledger queue for accounting verification
            </div>
            {accountingFilteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 italic text-[10px]">No expenses in this queue segment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="bg-neutral-100 border-b">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Requested By</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5">Verification</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {accountingFilteredExpenses.map(e => (
                      <tr key={e.id} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-mono font-bold text-neutral-500">{e.id}</td>
                        <td className="p-2.5 font-bold uppercase text-[8px]">
                          {e.expense_type === 'request' ? (
                            <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2">Request</span>
                          ) : (
                            <span className="text-orange-700 bg-orange-50 border border-orange-200 px-1 py-0.2">Claim</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-neutral-900">
                          {e.title}
                          {e.vendorPayee && <span className="block text-[8px] text-neutral-500 font-normal">Vendor/Payee: {e.vendorPayee}</span>}
                        </td>
                        <td className="p-2.5">{e.requestedBy} ({e.department})</td>
                        <td className="p-2.5">{e.category}</td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {e.currency}{e.amount.toLocaleString()}
                          {e.reimbursableAmount !== undefined && (
                            <span className="block text-[8px] text-emerald-600 font-normal">Reimbursable: {e.currency}{e.reimbursableAmount.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-[9px] font-medium">
                          {e.attachment ? (
                            <span className="text-blue-600 underline">📎 Verified attachment: {e.attachment}</span>
                          ) : (
                            <span className="text-neutral-400 italic">No receipt file uploaded</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-1">
                          <button
                            onClick={() => setSelectedExpenseId(e.id)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                          >
                            Update Accounting info
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER FOR DETAILED INSPECTION */}
      {selectedExpenseId && activeExpense && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-neutral-200 p-4 z-50 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <strong className="text-[11px] font-mono text-neutral-500">{activeExpense.id}</strong>
              <h3 className="text-xs font-black uppercase text-neutral-900 leading-tight">{activeExpense.title}</h3>
            </div>
            <button
              onClick={() => setSelectedExpenseId(null)}
              className="text-neutral-400 hover:text-neutral-900 text-sm font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="bg-neutral-50 p-2.5 border text-[10px] space-y-1.5">
            <span className="font-bold text-[8px] uppercase tracking-wider text-neutral-400 block border-b pb-0.5">Specifications Summary</span>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div>
                <strong>Amount:</strong> <span className="font-mono">{activeExpense.currency}{activeExpense.amount.toLocaleString()}</span>
              </div>
              <div>
                <strong>Requested By:</strong> {activeExpense.requestedBy}
              </div>
              <div>
                <strong>Department:</strong> {activeExpense.department}
              </div>
              <div>
                <strong>Category:</strong> {activeExpense.category}
              </div>
              <div>
                <strong>Type:</strong> <span className="uppercase font-bold">{activeExpense.expense_type}</span>
              </div>
              <div>
                <strong>Status:</strong> <span className="font-bold text-neutral-950">{activeExpense.status}</span>
              </div>
            </div>
            {activeExpense.enquiryId && (
              <div className="pt-1.5 border-t">
                <strong>Linked Enquiry: </strong>
                <span
                  onClick={() => {
                    setSelectedEnquiryId(activeExpense.enquiryId!);
                    setCurrentView('enquiry-detail');
                    setSelectedExpenseId(null);
                  }}
                  className="text-blue-600 underline cursor-pointer font-bold"
                >
                  {activeExpense.enquiryId}
                </span>
              </div>
            )}
            {activeExpense.taskId && (
              <div>
                <strong>Linked Task: </strong>
                <span
                  onClick={() => {
                    setActiveTaskId(activeExpense.taskId!);
                    setSelectedExpenseId(null);
                  }}
                  className="text-blue-600 underline cursor-pointer font-bold"
                >
                  {activeExpense.taskId}
                </span>
              </div>
            )}
            {activeExpense.attachment && (
              <div className="text-blue-600 underline font-semibold cursor-pointer">
                📎 File Attachment: {activeExpense.attachment}
              </div>
            )}
            <p className="text-neutral-600 text-[10px] mt-1 pt-1.5 border-t"><strong>Description:</strong> {activeExpense.description}</p>
          </div>

          {/* Department Head actions when viewing pending in Drawer */}
          {canApprove(activeExpense) && (activeExpense.status === 'Submitted' || activeExpense.status === 'Pending Approval') && (
            <div className="bg-neutral-50 p-2.5 border space-y-2">
              <span className="font-bold text-[8px] uppercase tracking-wider text-neutral-400 block font-mono">Manager Approval actions</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleUpdateExpenseStatus(activeExpense.id, 'Sent to Accounting', `Approved by Manager (${currentUser.name})`)}
                  className="bg-emerald-600 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateExpenseStatus(activeExpense.id, 'Rejected', `Rejected by Manager (${currentUser.name})`)}
                  className="bg-red-600 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateExpenseStatus(activeExpense.id, 'Changes Requested', `Changes requested by Manager (${currentUser.name})`)}
                  className="bg-amber-500 text-white font-bold py-1 px-2.5 uppercase text-[8px]"
                >
                  Request Changes
                </button>
              </div>
            </div>
          )}

          {/* Accounting Desk details updates */}
          {(currentUser.department === 'Accounting' || currentUser.isPresident || currentUser.isAdmin) &&
            ['Approved', 'Sent to Accounting', 'Processing', 'Paid', 'Purchased/Paid', 'Completed'].includes(activeExpense.status) && (
            <div className="bg-neutral-50 p-2.5 border space-y-2 text-[10px]">
              <span className="font-bold text-[8px] uppercase tracking-wider text-neutral-400 block font-mono border-b pb-0.5">Accounting details updates</span>

              <div className="space-y-1">
                <label className="text-[8px] text-neutral-400 font-bold uppercase block">Record Vendor / Payee</label>
                <input
                  type="text"
                  value={accPayee}
                  onChange={e => setAccPayee(e.target.value)}
                  placeholder="e.g. SalesVendor Inc."
                  className="w-full bg-white border p-1 focus:outline-none"
                />
              </div>

              {activeExpense.expense_type === 'claim' && (
                <div className="space-y-1">
                  <label className="text-[8px] text-neutral-400 font-bold uppercase block">Confirm Reimbursable Amount (₹)</label>
                  <input
                    type="number"
                    value={accReimbursable}
                    onChange={e => setAccReimbursable(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border p-1 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[8px] text-neutral-400 font-bold uppercase block">Accounting Notes / Remarks</label>
                <input
                  type="text"
                  value={accNotes}
                  onChange={e => setAccNotes(e.target.value)}
                  placeholder="e.g. Cleared via bank wire ref #998"
                  className="w-full bg-white border p-1 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1 pt-1 border-t">
                <button
                  onClick={() => handleUpdateAccountingDetails(activeExpense.id, {
                    vendorPayee: accPayee,
                    reimbursableAmount: activeExpense.expense_type === 'claim' ? accReimbursable : undefined,
                    accountingNotes: accNotes,
                    status: 'Processing'
                  })}
                  className="bg-neutral-900 text-white font-bold py-1 px-2 uppercase text-[8px]"
                >
                  Verify & Process
                </button>
                <button
                  onClick={() => handleUpdateAccountingDetails(activeExpense.id, {
                    vendorPayee: accPayee,
                    reimbursableAmount: activeExpense.expense_type === 'claim' ? accReimbursable : undefined,
                    accountingNotes: accNotes,
                    status: activeExpense.expense_type === 'request' ? 'Purchased/Paid' : 'Paid'
                  })}
                  className="bg-emerald-600 text-white font-bold py-1 px-2 uppercase text-[8px]"
                >
                  Mark Paid/Purchased
                </button>
                <button
                  onClick={() => handleUpdateAccountingDetails(activeExpense.id, {
                    vendorPayee: accPayee,
                    reimbursableAmount: activeExpense.expense_type === 'claim' ? accReimbursable : undefined,
                    accountingNotes: accNotes,
                    status: 'Completed'
                  })}
                  className="bg-blue-600 text-white font-bold py-1 px-2 uppercase text-[8px]"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          )}

          {/* Timeline of events history */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-bold text-[8px] uppercase tracking-wider text-neutral-400 block border-b pb-0.5">Activity History</span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activeExpense.timeline.map((t, idx) => (
                <div key={idx} className="p-1 border bg-neutral-50 text-[9px]">
                  <span className="text-neutral-400 block">{t.date} &bull; {t.user}</span>
                  <strong>{t.text}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Comments section */}
          <div className="space-y-2 text-[10px]">
            <span className="font-bold text-[8px] uppercase tracking-wider text-neutral-400 block border-b pb-0.5">Expense Chat Workspace</span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activeExpense.comments.map((c, idx) => (
                <div key={idx} className="p-1.5 border-b">
                  <span className="text-neutral-400 block text-[8px]">{c.author} &bull; {c.date}</span>
                  <p className="text-neutral-800 font-medium">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Reply to thread..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 bg-white border p-1 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!commentText.trim()) return;
                  handleAddExpenseComment(activeExpense.id, commentText);
                  setCommentText('');
                }}
                className="bg-black text-white font-bold py-1 px-2.5 uppercase text-[8px]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
