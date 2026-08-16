import React from 'react';
import { Enquiry } from '../../types/crm';

interface SalesVendorsViewProps {
  enquiries: Enquiry[];
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
}

export function SalesVendorsView({
  enquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
}: SalesVendorsViewProps) {
  return (
    <div className="space-y-3">
      <div className="border-b border-neutral-200 pb-2">
        <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Sourcing Co-Operatives</h1>
        <p className="text-neutral-500 text-[10px]">Agronomic field units, safety ratings, and custom clearance statuses.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
              <th className="p-2">Enquiry Parent</th>
              <th className="p-2">Farming Cooperative</th>
              <th className="p-2">Safety Compliance Score</th>
              <th className="p-2">Quarantine Assessment</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {enquiries.map(enq => (
              <tr
                key={enq.id}
                onClick={() => {
                  setSelectedEnquiryId(enq.id);
                  setCurrentView('enquiry-detail');
                  setActiveTab('Vendor Approvals');
                }}
                className="hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <td className="p-2 font-mono font-bold text-neutral-900 underline">{enq.id}</td>
                <td className="p-2 font-semibold text-neutral-950">{enq.vendorApproval.vendorName}</td>
                <td className="p-2">{enq.vendorApproval.score}</td>
                <td className="p-2 font-mono">{enq.vendorApproval.complianceCheck}</td>
                <td className="p-2">
                  <span className="bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 text-[8px] font-bold text-neutral-700 uppercase">
                    {enq.vendorApproval.stage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
