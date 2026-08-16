import React from 'react';
import { Enquiry } from '../../types/crm';

interface SalesSamplingViewProps {
  enquiries: Enquiry[];
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
}

export function SalesSamplingView({
  enquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
}: SalesSamplingViewProps) {
  return (
    <div className="space-y-3">
      <div className="border-b border-neutral-200 pb-2">
        <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Sampling Log</h1>
        <p className="text-neutral-500 text-[10px]">Air waybill tracking for vacuum-sealed quality checking packets.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
              <th className="p-2">Sample ID</th>
              <th className="p-2">Enquiry Parent</th>
              <th className="p-2">Client Firm</th>
              <th className="p-2">Logistics Courier</th>
              <th className="p-2">AWB Tracking Reference</th>
              <th className="p-2">Lab Assessment Notes</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {enquiries.map(enq => (
              <tr
                key={enq.sampling.id}
                onClick={() => {
                  setSelectedEnquiryId(enq.id);
                  setCurrentView('enquiry-detail');
                  setActiveTab('Sampling');
                }}
                className="hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <td className="p-2 font-bold text-neutral-900 underline">{enq.sampling.id}</td>
                <td className="p-2 font-mono">{enq.id}</td>
                <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                <td className="p-2">{enq.sampling.carrier}</td>
                <td className="p-2 font-mono">{enq.sampling.trackingNumber}</td>
                <td className="p-2 text-neutral-500">{enq.sampling.notes}</td>
                <td className="p-2">
                  <span className="bg-neutral-100 border border-neutral-200 px-1 py-0.2 text-[8px] font-bold text-neutral-700 uppercase">
                    {enq.sampling.stage}
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
