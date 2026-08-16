import React from 'react';
import { Enquiry, Task } from '../../types/crm';

interface PresidentialOverviewViewProps {
  enquiries: Enquiry[];
  globalTasks: Task[];
}

export function PresidentialOverviewView({ enquiries, globalTasks }: PresidentialOverviewViewProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Presidential Command Overview</h1>
            <p className="text-neutral-500 text-[10px]">Central organizational health, operational throughput, and global financial funnel indicators.</p>
          </div>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 text-[8px] font-bold font-mono tracking-tight uppercase border border-amber-200">Executive clearance level</span>
        </div>
      </div>

      {/* High-Level Scorecard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total Organization Pipeline Value</span>
          <p className="text-lg font-black text-neutral-900 mt-0.5">$1,452,500</p>
          <span className="text-emerald-600 text-[9px] font-bold">↑ +18.4% YoY Growth</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Average Company-Wide SLA</span>
          <p className="text-lg font-black text-neutral-900 mt-0.5">94.2%</p>
          <span className="text-neutral-500 text-[9px]">Across background operational departments</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active Enquiries in Queue</span>
          <p className="text-lg font-black text-neutral-900 mt-0.5">{enquiries.length} Active</p>
          <span className="text-neutral-500 text-[9px]">Sourcing total: 72 Metric Tons</span>
        </div>
        <div className="bg-white border p-3">
          <span className="text-neutral-400 text-[8px] uppercase font-bold block">Pending New Roadblocks</span>
          <p className="text-lg font-black text-red-600 mt-0.5">
            {globalTasks.filter(t => t.status === 'Overdue').length} Overdue
          </p>
          <span className="text-red-500 text-[9px] font-bold">Requires escalation</span>
        </div>
      </div>

      {/* Departmental Workload Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Departmental Workload & Task Balancing */}
        <div className="bg-white border p-3 space-y-3">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1.5">Department Task Distribution Matrix</span>

          <div className="space-y-2">
            {['Sales', 'Costing', 'Sampling', 'Logistics', 'Compliance'].map(dept => {
              const count = globalTasks.filter(t => t.department === dept && t.status !== 'Completed').length;
              const completedCount = globalTasks.filter(t => t.department === dept && t.status === 'Completed').length;
              const percentage = (completedCount / (count + completedCount || 1)) * 100;
              return (
                <div key={dept} className="space-y-1 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-850">{dept} Team</span>
                    <span className="text-neutral-500 text-[9px]">
                      {count} Pending &bull; {completedCount} Resolved ({Math.round(percentage)}% Success Rate)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-none overflow-hidden">
                    <div className="bg-black h-1.5" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company-Wide Active Deals Sourcing Funnel */}
        <div className="bg-white border p-3 space-y-3">
          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1.5">Organizational Deal Ledger</span>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {enquiries.map(enq => (
              <div key={enq.id} className="p-2 border bg-neutral-50 text-[10px] flex justify-between items-center">
                <div>
                  <span className="font-bold block text-neutral-900">{enq.id} &mdash; {enq.customerName}</span>
                  <span className="text-[9px] text-neutral-500">Product: {enq.product} ({enq.quantity})</span>
                </div>
                <div className="text-right">
                  <span className="bg-white border text-neutral-700 px-1.5 py-0.5 text-[8px] font-bold font-mono uppercase block">
                    {enq.status}
                  </span>
                  <span className="text-[8px] text-neutral-400 mt-0.5 block">Owner: {enq.salesOwner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
