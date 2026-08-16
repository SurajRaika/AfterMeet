import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { User, Enquiry, Email, Prospect, Task, Expense } from '../types/crm';

interface CommandPaletteProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentView: string;
  handleNavClick: (viewKey: string) => void;
  triggerToast: (msg: string) => void;
  setEmailComposeOpen: (open: boolean) => void;
  setSelectedEnquiryId: (id: string) => void;
  setActiveTaskId: (id: string | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialMode: 'search' | 'action';
}

interface SearchResults {
  enquiries: Enquiry[];
  tasks: Task[];
  emails: Email[];
  prospects: Prospect[];
  expenses: Expense[];
}

export function CommandPalette({
  currentUser,
  setCurrentUser,
  currentView,
  handleNavClick,
  triggerToast,
  setEmailComposeOpen,
  setSelectedEnquiryId,
  setActiveTaskId,
  isOpen,
  setIsOpen,
  initialMode,
}: CommandPaletteProps) {
  const [mode, setMode] = useState<'search' | 'action'>(initialMode);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResults>({
    enquiries: [],
    tasks: [],
    emails: [],
    prospects: [],
    expenses: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  // Switchable profiles loaded from mock API
  const [switchableProfiles, setSwitchableProfiles] = useState<User[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Keep mode in sync with prop trigger
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setQuery(initialMode === 'action' ? '>' : '');
      setSelectedIndex(0);
      setShowProfileSwitcher(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialMode]);

  // Handle Query Changes
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);

    // If input starts with '>', force Action mode. If they remove '>', switch to Search mode.
    if (val.startsWith('>')) {
      setMode('action');
    } else {
      setMode('search');
    }
  };

  // Run Search Query
  useEffect(() => {
    if (mode === 'search' && query.trim().length > 0) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(async () => {
        try {
          const results = await apiClient.search.query(query);
          setSearchResults(results);
        } catch (err) {
          console.error('Error querying mock search API:', err);
        } finally {
          setIsSearching(false);
        }
      }, 150);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults({ enquiries: [], tasks: [], emails: [], prospects: [], expenses: [] });
    }
  }, [query, mode]);

  // Flattened results for easy list navigation
  const flattenedResults = React.useMemo(() => {
    if (mode === 'action') {
      if (showProfileSwitcher) {
        return switchableProfiles.map(p => ({
          type: 'profile' as const,
          id: p.id,
          title: `Switch profile to ${p.name}`,
          subtitle: `${p.role} (${p.department})`,
          icon: '👥',
          action: () => {
            setCurrentUser(p);
            triggerToast(`Workspace credentials switched to ${p.name} (${p.role})`);
            setIsOpen(false);
          },
        }));
      }

      // Action Commands list
      const actionQuery = query.startsWith('>') ? query.substring(1).trim().toLowerCase() : query.trim().toLowerCase();

      const allActions = [
        {
          type: 'action' as const,
          title: 'Switch Simulated Profile',
          subtitle: 'Fetch and swap crew identity credentials',
          icon: '👥',
          action: async () => {
            setIsLoadingProfiles(true);
            setShowProfileSwitcher(true);
            try {
              const profiles = await apiClient.users.getSwitchableProfiles();
              setSwitchableProfiles(profiles);
            } catch (err) {
              console.error('Failed to load switchable profiles:', err);
              triggerToast('Error loading switchable profiles.');
            } finally {
              setIsLoadingProfiles(false);
            }
          },
        },
        {
          type: 'action' as const,
          title: 'Compose Operational Memo',
          subtitle: 'Draft email to client or team',
          icon: '✉',
          action: () => {
            handleNavClick('personal-email');
            setEmailComposeOpen(true);
            setIsOpen(false);
          },
        },
        {
          type: 'action' as const,
          title: 'Go to Global Enquiry (All Types)',
          subtitle: 'Single organization-wide view across all sales channels',
          icon: '🌐',
          action: () => { handleNavClick('global-enquiry'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Sales Enquiry (Export Workspace)',
          subtitle: 'Export Sales pipeline & working deal tracker',
          icon: '📈',
          action: () => { handleNavClick('sales-tracker'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Outbound Prospects',
          subtitle: 'Check cold-outreach & Gemini outreach campaigns',
          icon: '🎯',
          action: () => { handleNavClick('sales-prospects'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Spend Overview',
          subtitle: 'Review total budgets and expenditures',
          icon: '💰',
          action: () => { handleNavClick('spend-overview'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Expense Requests',
          subtitle: 'Create or authorize operational purchases',
          icon: '💳',
          action: () => { handleNavClick('spend-requests'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Expense Claims',
          subtitle: 'Review reimbursement documents',
          icon: '📝',
          action: () => { handleNavClick('spend-claims'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to My Expenses',
          subtitle: 'Check history of your logged spends',
          icon: '💼',
          action: () => { handleNavClick('spend-my-expenses'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Approvals Queue',
          subtitle: 'Validate pending department expenditures',
          icon: '🤝',
          action: () => { handleNavClick('spend-approvals'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Accounting Desk',
          subtitle: 'Process financial ledger payouts',
          icon: '🏦',
          action: () => { handleNavClick('spend-accounting'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Costing Desk',
          subtitle: 'Calculate terminal shipping & packaging expenses',
          icon: '📊',
          action: () => { handleNavClick('ops-costing'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Sampling Desk',
          subtitle: 'Review physical sample dispatches & analytics',
          icon: '📦',
          action: () => { handleNavClick('ops-sampling'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Logistics Desk',
          subtitle: 'Manage container booking and carrier allocations',
          icon: '🚢',
          action: () => { handleNavClick('ops-logistics'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Compliance Desk',
          subtitle: 'Inspect phytosanitary certs & quarantine seals',
          icon: '⚖️',
          action: () => { handleNavClick('ops-compliance'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to HR Desk',
          subtitle: 'Track employee onboardings & training credentials',
          icon: '👥',
          action: () => { handleNavClick('ops-hr'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to My Tasks Inbox',
          subtitle: 'Review pending operations checklist items',
          icon: '✓',
          action: () => { handleNavClick('my-tasks'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Go to Presidential Command Overview',
          subtitle: 'Complete visibility over systems & tasks',
          icon: '👑',
          action: () => { handleNavClick('presidential-overview'); setIsOpen(false); },
        },
        {
          type: 'action' as const,
          title: 'Trigger Test Alert Notification',
          subtitle: 'Fires a mock toast notification',
          icon: '🔔',
          action: () => {
            triggerToast('Operational Command Executed successfully.');
            setIsOpen(false);
          },
        },
      ];

      return allActions.filter(act =>
        act.title.toLowerCase().includes(actionQuery) ||
        act.subtitle.toLowerCase().includes(actionQuery)
      );
    }

    // Search results lists
    const list: any[] = [];

    searchResults.enquiries.forEach(e => {
      const typeBadge = e.sales_type ? e.sales_type.toUpperCase() : 'EXPORT';
      list.push({
        type: 'enquiry' as const,
        id: e.id,
        title: `[${typeBadge}] ${e.id}: ${e.customerName}`,
        subtitle: `Product: ${e.product} • Port: ${e.destinationPort} • Status: ${e.status}`,
        icon: '📈',
        action: () => {
          setSelectedEnquiryId(e.id);
          handleNavClick('enquiry-detail');
          setIsOpen(false);
        },
      });
    });

    searchResults.tasks.forEach(t => {
      list.push({
        type: 'task' as const,
        id: t.id,
        title: `${t.id}: ${t.title}`,
        subtitle: `Assignee: ${t.assignee} • Priority: ${t.priority} • Status: ${t.status}`,
        icon: '✓',
        action: () => {
          setActiveTaskId(t.id);
          setIsOpen(false);
        },
      });
    });

    searchResults.emails.forEach(m => {
      list.push({
        type: 'email' as const,
        id: m.id,
        title: `Email: ${m.subject}`,
        subtitle: `From: ${m.senderName} (${m.sender}) • Date: ${m.date}`,
        icon: '✉',
        action: () => {
          handleNavClick('personal-email');
          setIsOpen(false);
        },
      });
    });

    searchResults.prospects.forEach(p => {
      list.push({
        type: 'prospect' as const,
        id: p.id,
        title: `Prospect: ${p.companyName}`,
        subtitle: `Contact: ${p.contactName} • Crop: ${p.cropInterest} • Sentiment: ${p.sentiment}`,
        icon: '🎯',
        action: () => {
          handleNavClick('sales-prospects');
          setIsOpen(false);
        },
      });
    });

    searchResults.expenses.forEach(e => {
      list.push({
        type: 'expense' as const,
        id: e.id,
        title: `${e.id}: ${e.title}`,
        subtitle: `Requested by: ${e.requestedBy} • Amount: ₹${e.amount} • Status: ${e.status}`,
        icon: '💰',
        action: () => {
          if (e.expense_type === 'request') {
            handleNavClick('spend-requests');
          } else {
            handleNavClick('spend-claims');
          }
          setIsOpen(false);
        },
      });
    });

    return list;
  }, [mode, searchResults, query, showProfileSwitcher, switchableProfiles]);

  // Keep active result scrolled into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, flattenedResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flattenedResults.length) % Math.max(1, flattenedResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeResult = flattenedResults[selectedIndex];
      if (activeResult) {
        activeResult.action();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle modes: Search <-> Action
      if (showProfileSwitcher) {
        setShowProfileSwitcher(false);
        setQuery('>');
        setMode('action');
      } else if (mode === 'search') {
        setMode('action');
        setQuery('>');
      } else {
        setMode('search');
        setQuery('');
      }
      setSelectedIndex(0);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
      className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-start justify-center pt-24 z-[9999] p-4 font-sans text-[11px] antialiased"
    >
      <div className="w-full max-w-2xl bg-white border border-neutral-300 shadow-2xl overflow-hidden flex flex-col">

        {/* Search Header Input bar */}
        <div className="flex items-center space-x-3 px-4 py-3 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <span className="text-neutral-500 text-sm font-bold">
            {mode === 'action' ? '>' : '🔍'}
          </span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none font-medium"
            placeholder={
              mode === 'action'
                ? "Type a command or backspace to switch to search..."
                : "Search anything... (or type '>' to trigger actions / switch profile)"
            }
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="px-1.5 py-0.5 text-[8.5px] font-mono bg-neutral-200 border border-neutral-300 text-neutral-600 rounded-sm">
              Tab to toggle mode
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 font-bold text-[12px] px-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Mode Indicators */}
        <div className="flex items-center px-4 py-1.5 border-b border-neutral-100 bg-neutral-50/50 text-[9px] text-neutral-400 font-bold uppercase tracking-wider space-x-4">
          <button
            onClick={() => {
              setMode('search');
              setQuery('');
              setShowProfileSwitcher(false);
            }}
            className={`transition-colors ${mode === 'search' ? 'text-neutral-950 underline underline-offset-4 decoration-2' : 'hover:text-neutral-600'}`}
          >
            🔍 Search Mode
          </button>
          <button
            onClick={() => {
              setMode('action');
              setQuery('>');
              setShowProfileSwitcher(false);
            }}
            className={`transition-colors ${mode === 'action' ? 'text-neutral-950 underline underline-offset-4 decoration-2' : 'hover:text-neutral-600'}`}
          >
            ⚡ Action Mode
          </button>
          <span className="ml-auto text-neutral-400 lowercase font-normal tracking-normal text-[8.5px]">
            {showProfileSwitcher ? "Choose switchable crew profile" : mode === 'search' ? "searching active deals, tasks, emails, prospects, claims" : "execute system commands & views"}
          </span>
        </div>

        {/* Results Pane */}
        <div
          ref={resultsContainerRef}
          className="max-h-[320px] overflow-y-auto divide-y divide-neutral-100 bg-white"
        >
          {isSearching || isLoadingProfiles ? (
            <div className="p-8 text-center text-neutral-500 font-mono italic animate-pulse">
              🚀 Querying mock database structures...
            </div>
          ) : flattenedResults.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 italic">
              No matching {mode === 'action' ? 'actions' : 'search results'} found for &quot;{query}&quot;
            </div>
          ) : (
            flattenedResults.map((item, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id || idx}`}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => item.action()}
                  className={`px-4 py-2.5 flex items-start space-x-3.5 cursor-pointer transition-colors ${
                    isActive ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'
                  }`}
                >
                  <span className={`text-sm select-none ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{item.title}</span>
                      {item.type !== 'action' && item.type !== 'profile' && (
                        <span className={`text-[8px] uppercase font-mono px-1 border rounded-xs ml-2 shrink-0 ${
                          isActive ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        }`}>
                          {item.type}
                        </span>
                      )}
                    </div>
                    <span className={`block text-[9.5px] truncate leading-tight mt-0.5 ${
                      isActive ? 'text-neutral-300' : 'text-neutral-500'
                    }`}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer help hint bar */}
        <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50 shrink-0 flex justify-between items-center text-[9.5px] text-neutral-500 font-mono">
          <div className="flex space-x-4">
            <span>↑↓ Navigate</span>
            <span>⏎ Execute</span>
            <span>⎋ Close</span>
          </div>
          <div>
            <span>Active: <strong className="text-neutral-800 font-bold uppercase">{currentUser.department} ({currentUser.name})</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
