import React from 'react';
import { User } from '../../types/crm';
import { USERS } from '../../constants/initialData';

interface RestrictedViewProps {
  currentUser: User;
  currentView: string;
  setCurrentUser: (user: User) => void;
  setCurrentView: (view: string) => void;
  triggerToast: (msg: string) => void;
}

export function RestrictedView({
  currentUser,
  currentView,
  setCurrentUser,
  setCurrentView,
  triggerToast,
}: RestrictedViewProps) {
  return (
    <div className="bg-white border border-neutral-200 p-8 text-center max-w-md mx-auto space-y-3">
      <span className="text-2xl block">🔒</span>
      <h2 className="text-xs font-bold uppercase text-neutral-900">Access Restricted</h2>
      <p className="text-neutral-500 leading-relaxed text-[10px]">
        Your active profile simulator (<strong>{currentUser.name}</strong>, assigned to the <strong>{currentUser.department} Team</strong>) is not cleared for this console.
      </p>

      <div className="border-t pt-3 space-y-1.5">
        <span className="text-[8px] text-neutral-400 font-bold block uppercase tracking-wider">Elevate Simulator Workspace Credentials</span>
        <div className="flex flex-col space-y-1">

          {currentView.includes('presidential') && (
            <button
              onClick={() => {
                setCurrentUser(USERS.arthur_president!);
                setCurrentView('presidential-overview');
                triggerToast('Credentials elevated to President Arthur Pendelton.');
              }}
              className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
            >
              Log in as President & CEO (Arthur Pendelton)
            </button>
          )}

          {!currentView.includes('presidential') && (
            <>
              {currentView.includes('prospects') && (
                <button
                  onClick={() => {
                    setCurrentUser(USERS.rajesh_sales_rep!);
                    setCurrentView('sales-prospects');
                    triggerToast('Workspace credentials upgraded to Rajesh Mehta (Sales).');
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                >
                  Switch to Sales Team
                </button>
              )}

              {currentView.includes('ops-') && (
                <button
                  onClick={() => {
                    if (currentView.includes('costing')) {
                      setCurrentUser(USERS.sarah_costing_head!);
                      setCurrentView('ops-costing');
                    } else if (currentView.includes('sampling')) {
                      setCurrentUser(USERS.liom_sampling_staff!);
                      setCurrentView('ops-sampling');
                    } else if (currentView.includes('logistics')) {
                      setCurrentUser(USERS.chloe_logistics_staff!);
                      setCurrentView('ops-logistics');
                    } else if (currentView.includes('compliance')) {
                      setCurrentUser(USERS.sophia_compliance_staff!);
                      setCurrentView('ops-compliance');
                    }
                    triggerToast('Workspace credentials updated.');
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                >
                  Auto-Switch to Authorized Department Member
                </button>
              )}

              {currentView.includes('dash-') && (
                <button
                  onClick={() => {
                    if (currentView.includes('sales')) {
                      setCurrentUser(USERS.amanda_sales_vp!);
                      setCurrentView('dash-sales');
                    } else if (currentView.includes('costing')) {
                      setCurrentUser(USERS.sarah_costing_head!);
                      setCurrentView('dash-costing');
                    } else if (currentView.includes('sampling')) {
                      setCurrentUser(USERS.oliver_sampling_head!);
                      setCurrentView('dash-sampling');
                    } else if (currentView.includes('logistics')) {
                      setCurrentUser(USERS.kenji_logistics_head!);
                      setCurrentView('dash-logistics');
                    } else if (currentView.includes('compliance')) {
                      setCurrentUser(USERS.elena_compliance_head!);
                      setCurrentView('dash-compliance');
                    }
                    triggerToast('Workspace credentials elevated to Department Manager.');
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                >
                  Auto-Elevate to Department Manager
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
