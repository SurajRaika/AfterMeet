import React from 'react';
import { Enquiry } from '../../types/crm';

interface SalesPOsViewProps {
  enquiries: Enquiry[];
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
}

export function SalesPOsView({
  enquiries,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
}: SalesPOsViewProps) {
  return (
    <div className="space-y-3">
      <div className="border-b border-neutral-200 pb-2">
        <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Purchase Orders</h1>
        <p className="text-neutral-500 text-[10px]">Active production contracts detailing total cargo value and container slots.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
              <th className="p-2">PO ID</th>
              <th className="p-2">Enquiry Parent</th>
              <th className="p-2">Client Firm</th>
              <th className="p-2">Total Financial Value</th>
              <th className="p-2">Container Allocation</th>
              <th className="p-2">Shipping Carrier</th>
              <th className="p-2">Loading Target Date</th>
              <th className="p-2">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {enquiries.map(enq => {
              if (!enq.purchaseOrder) return null;
              return (
                <tr
                  key={enq.purchaseOrder.id}
                  onClick={() => {
                    setSelectedEnquiryId(enq.id);
                    setCurrentView('enquiry-detail');
                    setActiveTab('Purchase Orders');
                  }}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <td className="p-2 font-bold text-neutral-900 underline">{enq.purchaseOrder.id}</td>
                  <td className="p-2 font-mono">{enq.id}</td>
                  <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                  <td className="p-2 font-mono font-bold">{enq.purchaseOrder.totalValue}</td>
                  <td className="p-2">{enq.purchaseOrder.shippingContainerCount}</td>
                  <td className="p-2">{enq.purchaseOrder.carrier}</td>
                  <td className="p-2 font-mono">{enq.purchaseOrder.loadingDate}</td>
                  <td className="p-2">
                    <span className="bg-neutral-900 text-white px-1 py-0.2 text-[8px] font-bold uppercase">
                      {enq.purchaseOrder.stage}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
