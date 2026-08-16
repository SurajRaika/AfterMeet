import React from 'react';
import { User, Task } from '../types/crm';
import { USERS } from '../constants/initialData';

interface SidebarProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentView: string;
  handleNavClick: (viewKey: string) => void;
  personalTasks: Task[];
  checkPermissions: (viewKey: string) => boolean;
  triggerToast: (msg: string) => void;
}

export function Sidebar({
  currentUser,
  setCurrentUser,
  currentView,
  handleNavClick,
  personalTasks,
  checkPermissions,
  triggerToast,
}: SidebarProps) {
  const renderPermissionBadge = (viewKey: string) => {
    const isAllowed = checkPermissions(viewKey);
    return isAllowed ? (
      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 border border-emerald-200 uppercase tracking-tight">Active</span>
    ) : (
      <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 border border-amber-200 uppercase tracking-tight">Locked 🔒</span>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 rounded-none overflow-hidden">
      <div className="overflow-y-auto flex-1">

        {/* Top Brand Block */}
        <div className="p-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-black flex items-center justify-center text-white font-black text-[10px] rounded-none">A</span>
            <span className="font-bold text-neutral-900 tracking-tight text-[10px] uppercase">aftermeet io Enterprise Operations Platform</span>
          </div>
        </div>

        {/* DYNAMIC ROLE SELECTOR (Simulation Switcher) */}
        <div className="m-2 p-2 bg-neutral-50 border border-neutral-200 rounded-none">
          <span className="text-[9px] text-neutral-400 font-bold block uppercase tracking-wider mb-1">Simulate Crew Profile</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const nextUser = USERS[e.target.value];
              if (nextUser) {
                setCurrentUser(nextUser);
                triggerToast(`Workspace credentials switched to ${nextUser.name} (${nextUser.role})`);
              }
            }}
            className="w-full bg-white border border-neutral-200 rounded-none p-1 text-[11px] text-neutral-800 font-medium focus:outline-none"
          >
            <optgroup label="1. EXECUTIVE DESK">
              <option value="arthur_president">Arthur Pendelton [Executive CEO]</option>
              <option value="amanda_sales_vp">Amanda Vance [Sales VP]</option>
              <option value="marcus_ops_vp">Marcus Brody [Operations VP]</option>
            </optgroup>
            <optgroup label="2. DEPARTMENT HEADS">
              <option value="sarah_costing_head">Sarah Jenkins [Costing Head]</option>
              <option value="oliver_sampling_head">Oliver Vance [Sampling Head]</option>
              <option value="kenji_logistics_head">Kenji Sato [Logistics Head]</option>
              <option value="elena_compliance_head">Elena Rostova [Compliance Head]</option>
              <option value="harriet_hr_head">Harriet Reid [HR Head]</option>
            </optgroup>
            <optgroup label="3. OPERATIONS STAFF">
              <option value="rajesh_sales_rep">Rajesh Mehta [Sales Rep]</option>
              <option value="tom_costing_staff">Tom Harris [Costing Analyst]</option>
              <option value="liom_sampling_staff">Liam Carter [Sampling Tech]</option>
              <option value="chloe_logistics_staff">Chloe Taylor [Logistics Operator]</option>
              <option value="sophia_compliance_staff">Sophia Miller [Compliance Clerk]</option>
              <option value="accounting_clerk">Penny Bigelow [Accounting Officer]</option>
            </optgroup>
            <optgroup label="4. ACCOUNTING DESK">
              <option value="accounting_head">Richard Feynman [Accounting Head]</option>
            </optgroup>
          </select>
        </div>

        <nav className="px-2 py-1 space-y-3">

          {/* PERSONAL TASKS & COMMUNICATION */}
          <div>
            <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Workspace Tools
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('my-tasks')}
                className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'my-tasks' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>My Tasks Inbox</span>
                </span>
                <span className={`text-[9px] px-1 font-mono border ${currentView === 'my-tasks' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                  {personalTasks.filter(t => t.status !== 'Completed').length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('personal-email')}
                className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'personal-email' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>✉</span>
                  <span>Personal Mailbox</span>
                </span>
                {renderPermissionBadge('personal-email')}
              </button>
            </div>
          </div>

          {/* SPEND MANAGEMENT TOP LEVEL SYSTEM */}
          <div>
            <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Spend Management
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('spend-overview')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'spend-overview' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>📈 Spend Overview</span>
                {renderPermissionBadge('spend-overview')}
              </button>

              <button
                onClick={() => handleNavClick('spend-requests')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'spend-requests' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>💳 Expense Requests</span>
                {renderPermissionBadge('spend-requests')}
              </button>

              <button
                onClick={() => handleNavClick('spend-claims')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'spend-claims' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>📝 Expense Claims</span>
                {renderPermissionBadge('spend-claims')}
              </button>

              <button
                onClick={() => handleNavClick('spend-my-expenses')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'spend-my-expenses' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>💼 My Expenses</span>
                {renderPermissionBadge('spend-my-expenses')}
              </button>

              <button
                onClick={() => handleNavClick('spend-approvals')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'spend-approvals' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>🤝 Approvals Queue</span>
                {renderPermissionBadge('spend-approvals')}
              </button>

              <button
                onClick={() => handleNavClick('spend-accounting')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'spend-accounting' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>🏦 Accounting Desk</span>
                {renderPermissionBadge('spend-accounting')}
              </button>
            </div>
          </div>

          {/* FRONT-END SALES SECTION */}
          <div>
            <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Sales Front-End
            </span>

            {/* Global Directory Overview */}
            <button
              onClick={() => handleNavClick('global-enquiry')}
              className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-bold transition-colors mb-1 ${
                currentView === 'global-enquiry' ? 'bg-neutral-900 text-white' : 'text-neutral-900 bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <span>🌐 Global Enquiry (All Types)</span>
              </span>
              {renderPermissionBadge('global-enquiry')}
            </button>

            {/* Outbound Prospects Panel */}
            <button
              onClick={() => handleNavClick('sales-prospects')}
              className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                currentView === 'sales-prospects' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <span>Outbound Prospects</span>
              </span>
              {renderPermissionBadge('sales-prospects')}
            </button>

            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('sales-tracker')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'sales-tracker' || currentView === 'sales-enquiry' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>Sales Enquiry (Export Workspace)</span>
                {renderPermissionBadge('sales-tracker')}
              </button>

              {/* Indented child views representing child modules of all enquiries */}
              <div className="pl-3 border-l border-neutral-200 ml-2 space-y-0.5">
                <button
                  onClick={() => handleNavClick('sales-quotations')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                    currentView === 'sales-quotations' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>↳ Quotations Log</span>
                  {renderPermissionBadge('sales-quotations')}
                </button>

                <button
                  onClick={() => handleNavClick('sales-sampling')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                    currentView === 'sales-sampling' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>↳ Sampling Records</span>
                  {renderPermissionBadge('sales-sampling')}
                </button>

                <button
                  onClick={() => handleNavClick('sales-pos')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                    currentView === 'sales-pos' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>↳ Purchase Orders</span>
                  {renderPermissionBadge('sales-pos')}
                </button>

                <button
                  onClick={() => handleNavClick('sales-vendors')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                    currentView === 'sales-vendors' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>↳ Vendor Approvals</span>
                  {renderPermissionBadge('sales-vendors')}
                </button>

                <button
                  onClick={() => handleNavClick('sales-contracts')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                    currentView === 'sales-contracts' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>↳ Contracts Registry</span>
                  {renderPermissionBadge('sales-contracts')}
                </button>
              </div>
            </div>
          </div>

          {/* OPERATIONS STAFF WORKSPACE */}
          <div>
            <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Operations Back-End
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('ops-costing')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'ops-costing' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>📊 Costing Desk</span>
                {renderPermissionBadge('ops-costing')}
              </button>

              <button
                onClick={() => handleNavClick('ops-sampling')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'ops-sampling' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>📦 Sampling Desk</span>
                {renderPermissionBadge('ops-sampling')}
              </button>

              <button
                onClick={() => handleNavClick('ops-logistics')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'ops-logistics' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>🚢 Logistics Desk</span>
                {renderPermissionBadge('ops-logistics')}
              </button>

              <button
                onClick={() => handleNavClick('ops-compliance')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'ops-compliance' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>⚖️ Compliance Desk</span>
                {renderPermissionBadge('ops-compliance')}
              </button>

              <button
                onClick={() => handleNavClick('ops-hr')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'ops-hr' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>👥 HR Desk</span>
                {renderPermissionBadge('ops-hr')}
              </button>
            </div>
          </div>

          {/* DEPARTMENT DASHBOARDS */}
          <div>
            <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Dashboard of Departments
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('dash-sales')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'dash-sales' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>↳ Sales Trade Stats</span>
                {renderPermissionBadge('dash-sales')}
              </button>

              <button
                onClick={() => handleNavClick('dash-costing')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'dash-costing' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>↳ Costing Turnaround</span>
                {renderPermissionBadge('dash-costing')}
              </button>

              <button
                onClick={() => handleNavClick('dash-sampling')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'dash-sampling' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>↳ Sampling Quality</span>
                {renderPermissionBadge('dash-sampling')}
              </button>

              <button
                onClick={() => handleNavClick('dash-logistics')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'dash-logistics' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>↳ Ocean Freight KPIs</span>
                {renderPermissionBadge('dash-logistics')}
              </button>

              <button
                onClick={() => handleNavClick('dash-compliance')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'dash-compliance' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>↳ Quarantine Audits</span>
                {renderPermissionBadge('dash-compliance')}
              </button>

              <button
                onClick={() => handleNavClick('dash-hr')}
                className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'dash-hr' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>↳ HR Operations</span>
                {renderPermissionBadge('dash-hr')}
              </button>
            </div>
          </div>

          {/* PRESIDENTIAL COMMAND OVERVIEW */}
          <div>
            <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Executive Desk
            </span>
            <button
              onClick={() => handleNavClick('presidential-overview')}
              className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-medium transition-colors ${
                currentView === 'presidential-overview' ? 'bg-neutral-900 text-white' : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>👑</span>
                <span className="font-bold">Presidential Command</span>
              </span>
              {renderPermissionBadge('presidential-overview')}
            </button>
          </div>

        </nav>
      </div>

      {/* ACTIVE OPERATOR METADATA CARD */}
      <div className="p-2.5 bg-neutral-100 border-t border-neutral-200 flex items-center space-x-2 shrink-0">
        <div className="w-7 h-7 bg-neutral-900 text-white font-bold flex items-center justify-center text-[10px] rounded-none">
          {currentUser.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-bold text-neutral-900 leading-tight truncate">{currentUser.name}</span>
          <span className="block text-neutral-500 text-[9px] leading-none truncate">{currentUser.role}</span>
        </div>
      </div>
    </aside>
  );
}
