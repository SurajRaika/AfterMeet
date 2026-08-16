import React from 'react';
import { Enquiry } from '../../types/crm';

interface SalesContractsViewProps {
  enquiries: Enquiry[];
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
}

export function SalesContractsView({
  enquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
}: SalesContractsViewProps) {
  return (
    <div className="space-y-3">
      <div className="border-b border-neutral-200 pb-2">
        <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Contracts Log</h1>
        <p className="text-neutral-500 text-[10px]">Commercial sales agreements and legal digital signatures.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
              <th className="p-2">Enquiry Parent</th>
              <th className="p-2">Client Firm</th>
              <th className="p-2">Sales Agreement Document</th>
              <th className="p-2">Execution Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {enquiries.map(enq => (
              <tr
                key={enq.id}
                onClick={() => {
                  setSelectedEnquiryId(enq.id);
                  setCurrentView('enquiry-detail');
                  setActiveTab('Contracts');
                }}
                className="hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <td className="p-2 font-mono font-bold text-neutral-900 underline">{enq.id}</td>
                <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                <td className="p-2 font-mono">{enq.contract.file} ({enq.contract.version})</td>
                <td className="p-2">
                  <span className="bg-neutral-100 border px-2 py-0.2 text-[8px] font-bold uppercase text-neutral-600">
                    {enq.contract.signatureStatus}
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
