import React, { useState, useEffect, useRef } from 'react';
import { User, Email, Enquiry, EmailAttachment } from '../../types/crm';

interface PersonalMailboxViewProps {
  currentUser: User;
  emails: Email[];
  enquiries: Enquiry[];
  emailFolder: string;
  setEmailFolder: (folder: string) => void;
  selectedEmailId: string;
  setSelectedEmailId: (id: string) => void;
  emailComposeOpen: boolean;
  setEmailComposeOpen: (open: boolean) => void;
  composeTo: string;
  setComposeTo: (to: string) => void;
  composeCc: string;
  setComposeCc: (cc: string) => void;
  composeBcc: string;
  setComposeBcc: (bcc: string) => void;
  composeSubject: string;
  setComposeSubject: (subject: string) => void;
  composeBody: string;
  setComposeBody: (body: string) => void;
  composeEnquiry: string;
  setComposeEnquiry: (enquiry: string) => void;
  composeAttachments: EmailAttachment[];
  setComposeAttachments: React.Dispatch<React.SetStateAction<EmailAttachment[]>>;
  emailSearchQuery: string;
  setEmailSearchQuery: (query: string) => void;
  activeDraftId: string | null;
  setActiveDraftId: (id: string | null) => void;
  draftSavedStatus: string;
  setDraftSavedStatus: (status: string) => void;
  handleSaveDraft: (toValue: string, ccValue: string, bccValue: string, subjectValue: string, bodyValue: string, enquiryValue: string, filesValue: EmailAttachment[]) => void;
  handleSendEmail: (e: React.FormEvent) => void;
  handleToggleStarEmail: (id: string) => void;
  handleArchiveEmail: (id: string, archive: boolean) => void;
  handleTrashEmail: (id: string, trash: boolean) => void;
  handleDeleteEmailPermanently: (id: string) => void;
  userFilteredEmails: Email[];
  activeEmail: Email | null;
  setSelectedEnquiryId: (id: string) => void;
  setCurrentView: (view: string) => void;
  setActiveTab: (tab: string) => void;
}

export function PersonalMailboxView({
  currentUser,
  emails,
  enquiries,
  emailFolder,
  setEmailFolder,
  selectedEmailId,
  setSelectedEmailId,
  emailComposeOpen,
  setEmailComposeOpen,
  composeTo,
  setComposeTo,
  composeCc,
  setComposeCc,
  composeBcc,
  setComposeBcc,
  composeSubject,
  setComposeSubject,
  composeBody,
  setComposeBody,
  composeEnquiry,
  setComposeEnquiry,
  composeAttachments,
  setComposeAttachments,
  emailSearchQuery,
  setEmailSearchQuery,
  activeDraftId,
  setActiveDraftId,
  draftSavedStatus,
  setDraftSavedStatus,
  handleSaveDraft,
  handleSendEmail,
  handleToggleStarEmail,
  handleArchiveEmail,
  handleTrashEmail,
  handleDeleteEmailPermanently,
  userFilteredEmails,
  activeEmail,
  setSelectedEnquiryId,
  setCurrentView,
  setActiveTab,
}: PersonalMailboxViewProps) {
  // Mock file list options for attachment simulator
  const mockAvailableFiles: EmailAttachment[] = [
    { name: 'Sourcing_Specification_SLA.pdf', size: '1.4 MB', type: 'application/pdf' },
    { name: 'Export_Customs_Declaration.xlsx', size: '2.8 MB', type: 'application/vnd.ms-excel' },
    { name: 'Phytosanitary_Clearance_Seal.png', size: '840 KB', type: 'image/png' },
    { name: 'Hamburg_Port_Spot_Rate_Quote.pdf', size: '512 KB', type: 'application/pdf' },
  ];

  // Ref for debouncing auto-saves
  const autoSaveTimerRef = useRef<any>(null);

  // Trigger auto-save when compose values change
  useEffect(() => {
    if (emailComposeOpen) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveDraft(
          composeTo,
          composeCc,
          composeBcc,
          composeSubject,
          composeBody,
          composeEnquiry,
          composeAttachments
        );
      }, 1000); // 1-second debounce auto-save
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [composeTo, composeCc, composeBcc, composeSubject, composeBody, composeEnquiry, composeAttachments, emailComposeOpen]);

  // Grouping emails by Thread (using subject or explicit threadId)
  const threadMap = React.useMemo(() => {
    const map: Record<string, Email[]> = {};
    emails.forEach(email => {
      const key = email.threadId || email.subject.replace(/^Re:\s*/i, '').trim();
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(email);
    });
    return map;
  }, [emails]);

  // Unique Thread list based on filtered emails
  const filteredThreads = React.useMemo(() => {
    const threadKeys = new Set<string>();
    const threadList: { key: string; emails: Email[]; latestEmail: Email }[] = [];

    userFilteredEmails.forEach(email => {
      const key = email.threadId || email.subject.replace(/^Re:\s*/i, '').trim();
      if (!threadKeys.has(key)) {
        threadKeys.add(key);
        // Get all emails in this thread from the global lists, sorted by date/time
        const threadEmails = (threadMap[key] || []).sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const latestEmail = threadEmails[threadEmails.length - 1] || email;
        threadList.push({
          key,
          emails: threadEmails,
          latestEmail
        });
      }
    });

    // Sort threads by latest message date descending
    return threadList.sort((a, b) => {
      return new Date(b.latestEmail.date).getTime() - new Date(a.latestEmail.date).getTime();
    });
  }, [userFilteredEmails, threadMap]);

  // Active Thread matching the active email
  const activeThread = React.useMemo(() => {
    if (!activeEmail) return null;
    const key = activeEmail.threadId || activeEmail.subject.replace(/^Re:\s*/i, '').trim();
    return (threadMap[key] || []).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [activeEmail, threadMap]);

  // Count unread in folders
  const folderCounts = React.useMemo(() => {
    return {
      inbox: emails.filter(m => m.recipient === currentUser.email && !m.isArchived && !m.isTrash && !m.isDraft).length,
      sent: emails.filter(m => m.sender === currentUser.email && !m.isArchived && !m.isTrash && !m.isDraft).length,
      drafts: emails.filter(m => m.isDraft && !m.isTrash).length,
      starred: emails.filter(m => m.isStarred && !m.isTrash).length,
      archive: emails.filter(m => m.isArchived && !m.isTrash).length,
      trash: emails.filter(m => m.isTrash).length,
    };
  }, [emails, currentUser.email]);

  return (
    <div className="space-y-3 bg-white border border-neutral-200 p-4 rounded-none min-h-[580px] flex flex-col justify-between">
      <div>
        {/* Terminal Header */}
        <div className="border-b border-neutral-200 pb-2 flex justify-between items-center bg-neutral-50 -m-4 mb-3 p-4">
          <div>
            <h1 className="text-xs font-black text-neutral-950 uppercase tracking-tight flex items-center space-x-1.5">
              <span>✉</span>
              <span>Secure Mailbox Console v2.0</span>
            </h1>
            <p className="text-neutral-500 text-[10px]">
              Assigned Endpoint: <span className="font-mono text-neutral-900 font-bold bg-neutral-200 px-1 py-0.5">{currentUser.email}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {emailComposeOpen && draftSavedStatus && (
              <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-bold animate-pulse">
                {draftSavedStatus}
              </span>
            )}
            <button
              onClick={() => {
                setActiveDraftId(null);
                setComposeTo('');
                setComposeCc('');
                setComposeBcc('');
                setComposeSubject('');
                setComposeBody('');
                setComposeEnquiry('');
                setComposeAttachments([]);
                setEmailComposeOpen(true);
              }}
              className="bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] px-3 py-1 font-bold uppercase rounded-none tracking-tight transition-colors"
            >
              + Compose Operational Memo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Folders & Directory Left Sidebar */}
          <div className="md:col-span-3 space-y-1 pr-2">
            <span className="text-[9px] font-black uppercase text-neutral-400 block px-2 mb-2 tracking-wider">Mail Folders</span>

            <button
              onClick={() => { setEmailFolder('inbox'); setEmailComposeOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-tight font-medium flex justify-between transition-all ${emailFolder === 'inbox' && !emailComposeOpen ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <span>📥 Inbox Queue</span>
              <span className={`px-1 font-mono text-[9px] ${emailFolder === 'inbox' && !emailComposeOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {folderCounts.inbox}
              </span>
            </button>

            <button
              onClick={() => { setEmailFolder('sent'); setEmailComposeOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-tight font-medium flex justify-between transition-all ${emailFolder === 'sent' && !emailComposeOpen ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <span>📤 Sent Log</span>
              <span className={`px-1 font-mono text-[9px] ${emailFolder === 'sent' && !emailComposeOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {folderCounts.sent}
              </span>
            </button>

            <button
              onClick={() => { setEmailFolder('drafts'); setEmailComposeOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-tight font-medium flex justify-between transition-all ${emailFolder === 'drafts' && !emailComposeOpen ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <span>📝 Auto-Drafts</span>
              <span className={`px-1 font-mono text-[9px] ${emailFolder === 'drafts' && !emailComposeOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {folderCounts.drafts}
              </span>
            </button>

            <button
              onClick={() => { setEmailFolder('starred'); setEmailComposeOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-tight font-medium flex justify-between transition-all ${emailFolder === 'starred' && !emailComposeOpen ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <span>⭐️ Starred Items</span>
              <span className={`px-1 font-mono text-[9px] ${emailFolder === 'starred' && !emailComposeOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {folderCounts.starred}
              </span>
            </button>

            <button
              onClick={() => { setEmailFolder('archive'); setEmailComposeOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-tight font-medium flex justify-between transition-all ${emailFolder === 'archive' && !emailComposeOpen ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <span>📁 Archives</span>
              <span className={`px-1 font-mono text-[9px] ${emailFolder === 'archive' && !emailComposeOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {folderCounts.archive}
              </span>
            </button>

            <button
              onClick={() => { setEmailFolder('trash'); setEmailComposeOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-[10px] uppercase tracking-tight font-medium flex justify-between transition-all ${emailFolder === 'trash' && !emailComposeOpen ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              <span>🗑️ Trash Terminal</span>
              <span className={`px-1 font-mono text-[9px] ${emailFolder === 'trash' && !emailComposeOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {folderCounts.trash}
              </span>
            </button>
          </div>

          {/* Mailbox List Center Column */}
          <div className="md:col-span-4 border-l border-r border-neutral-200 px-3 max-h-[500px] overflow-y-auto space-y-2">
            <div className="sticky top-0 bg-white pb-2 pt-0.5 space-y-1.5 z-10">
              <span className="text-[9px] font-black uppercase text-neutral-400 block tracking-wider">Operational Queues</span>
              <input
                type="text"
                placeholder="🔍 Search memo content, tags or reference..."
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 px-2 py-1 text-[10px] placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
              />
            </div>

            {emailComposeOpen ? (
              <div className="text-neutral-400 text-[10px] italic p-4 text-center border border-dashed border-neutral-200 bg-neutral-50">
                Compose mode active. Use the draft panel on the right.
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-neutral-400 text-[10px] p-4 text-center border border-dashed border-neutral-200 bg-neutral-50">
                No conversations found in this terminal queue
              </div>
            ) : (
              filteredThreads.map(({ key, emails: threadEmails, latestEmail }) => {
                const isSelected = activeEmail && (activeEmail.threadId === latestEmail.threadId || latestEmail.subject.includes(activeEmail.subject.replace('Re:', '').trim()));
                const hasUnread = threadEmails.some(m => m.unread && m.recipient === currentUser.email);
                const hasAttachments = threadEmails.some(m => m.attachments && m.attachments.length > 0);
                const threadStarred = threadEmails.some(m => m.isStarred);

                return (
                  <div
                    key={latestEmail.id}
                    onClick={() => {
                      setSelectedEmailId(latestEmail.id);
                      // Mark all emails in the thread as read
                      threadEmails.forEach(m => {
                        if (m.recipient === currentUser.email) m.unread = false;
                      });
                    }}
                    className={`p-2.5 border cursor-pointer transition-all ${isSelected ? 'border-neutral-950 bg-neutral-50 shadow-sm' : 'border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {hasUnread && <span className="w-1.5 h-1.5 bg-neutral-950 rounded-full shrink-0"></span>}
                        <span className={`truncate text-[10px] font-bold ${hasUnread ? 'text-neutral-950' : 'text-neutral-700'}`}>
                          {emailFolder === 'inbox' ? latestEmail.senderName : `To: ${latestEmail.recipient}`}
                        </span>
                        {threadEmails.length > 1 && (
                          <span className="bg-neutral-200 px-1 text-[8px] font-bold text-neutral-800 rounded-sm">
                            {threadEmails.length}
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] text-neutral-400 font-mono tracking-tight shrink-0">{latestEmail.date}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`font-semibold truncate text-[10px] ${hasUnread ? 'text-neutral-950 font-black' : 'text-neutral-800'}`}>
                        {latestEmail.subject}
                      </p>
                      <div className="flex items-center space-x-1 shrink-0 ml-1">
                        {threadStarred && <span className="text-amber-500 text-[10px]">★</span>}
                        {hasAttachments && <span className="text-neutral-400 text-[10px]">📎</span>}
                      </div>
                    </div>

                    <p className="text-[9px] text-neutral-500 truncate mt-0.5 leading-snug">{latestEmail.body}</p>

                    {latestEmail.enquiryId && (
                      <span className="inline-block mt-1 bg-neutral-100 text-neutral-600 px-1 py-0.5 text-[8px] font-mono border border-neutral-200 uppercase">
                        {latestEmail.enquiryId}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Detailed Email View Right Column */}
          <div className="md:col-span-5 min-h-[420px] flex flex-col justify-between pl-2">
            {emailComposeOpen ? (
              /* COMPOSE EMAIL FORM */
              <form onSubmit={handleSendEmail} className="space-y-3 border border-neutral-300 p-3 bg-neutral-50">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="font-black uppercase text-[10px] text-neutral-950 tracking-tight flex items-center space-x-1.5">
                    <span>✏️</span>
                    <span>Draft New Dispatch</span>
                  </span>
                  {activeDraftId && (
                    <span className="text-[8px] font-mono text-neutral-400">
                      ID: {activeDraftId}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">Recipient (To:)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.j@tradedesk.com"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full bg-white border border-neutral-200 px-2 py-1 text-[10px] focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">CC (Carbon Copy)</label>
                    <input
                      type="text"
                      placeholder="e.g. admin@tradedesk.com"
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1 text-[10px] focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">BCC (Blind CC)</label>
                    <input
                      type="text"
                      placeholder="e.g. archive@tradedesk.com"
                      value={composeBcc}
                      onChange={(e) => setComposeBcc(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1 text-[10px] focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">Subject Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide actionable summary..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-white border border-neutral-200 px-2 py-1 text-[10px] focus:outline-none focus:border-neutral-950 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">Reference Enquiry ID</label>
                    <select
                      value={composeEnquiry}
                      onChange={(e) => setComposeEnquiry(e.target.value)}
                      className="w-full bg-white border border-neutral-200 p-1 text-[10px] focus:outline-none focus:border-neutral-950"
                    >
                      <option value="">(None / Standalone Memo)</option>
                      {enquiries.map(e => (
                        <option key={e.id} value={e.id}>{e.id} - {e.customerName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">Simulate Attachment</label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const fileObj = mockAvailableFiles.find(f => f.name === val);
                          if (fileObj && !composeAttachments.some(x => x.name === fileObj.name)) {
                            setComposeAttachments([...composeAttachments, fileObj]);
                          }
                          e.target.value = ''; // Reset selector
                        }
                      }}
                      className="w-full bg-white border border-neutral-200 p-1 text-[10px] focus:outline-none focus:border-neutral-950"
                    >
                      <option value="">+ Choose file to attach...</option>
                      {mockAvailableFiles.map(f => (
                        <option key={f.name} value={f.name}>{f.name} ({f.size})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Render Selected Attachments */}
                {composeAttachments.length > 0 && (
                  <div className="space-y-1 bg-white border border-neutral-200 p-2">
                    <span className="text-[7.5px] uppercase font-black text-neutral-400 block tracking-wider">Attached Materials ({composeAttachments.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {composeAttachments.map(file => (
                        <div key={file.name} className="flex items-center space-x-1.5 bg-neutral-50 px-1.5 py-0.5 border border-neutral-300 text-[8.5px] font-mono">
                          <span>📎 {file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setComposeAttachments(composeAttachments.filter(f => f.name !== file.name));
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1 text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[8px] uppercase font-bold text-neutral-500 block mb-0.5">Message Body</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Draft your operational memo here..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2 text-[10px] focus:outline-none focus:border-neutral-950 resize-none font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-between pt-1">
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-neutral-950 text-white hover:bg-neutral-800 font-bold uppercase px-4 py-1 text-[9.5px] rounded-none tracking-tight transition-colors"
                    >
                      🚀 Send Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Keep current draft but close composer
                        setEmailComposeOpen(false);
                      }}
                      className="bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 font-bold uppercase px-3 py-1 text-[9.5px] rounded-none tracking-tight transition-all"
                    >
                      Close & Keep Draft
                    </button>
                  </div>

                  {activeDraftId && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteEmailPermanently(activeDraftId);
                        setEmailComposeOpen(false);
                        setActiveDraftId(null);
                      }}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold uppercase px-3 py-1 text-[9.5px] rounded-none tracking-tight transition-all"
                    >
                      🗑️ Discard Draft
                    </button>
                  )}
                </div>
              </form>
            ) : activeThread && activeThread.length > 0 ? (
              /* EMAIL READER PANEL - CONVERSATIONAL THREAD STACK */
              <div className="space-y-3.5">
                <div className="flex justify-between items-center bg-neutral-100 p-2 border border-neutral-200">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-950 block leading-tight">Conversation Thread</span>
                    <span className="text-[8.5px] text-neutral-500 font-mono mt-0.5 block">Subject ID: {activeThread[0]?.subject.replace(/^Re:\s*/i, '')}</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => handleToggleStarEmail(activeEmail!.id)}
                      className={`text-[9px] font-bold uppercase py-0.5 px-2 border ${activeEmail?.isStarred ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-neutral-300 text-neutral-700'}`}
                    >
                      {activeEmail?.isStarred ? '★ Starred' : '☆ Star'}
                    </button>

                    <button
                      onClick={() => handleArchiveEmail(activeEmail!.id, !activeEmail?.isArchived)}
                      className={`text-[9px] font-bold uppercase py-0.5 px-2 border bg-white border-neutral-300 text-neutral-700`}
                    >
                      {activeEmail?.isArchived ? '📥 Move to Inbox' : '📁 Archive'}
                    </button>

                    {activeEmail?.isTrash ? (
                      <>
                        <button
                          onClick={() => handleTrashEmail(activeEmail!.id, false)}
                          className="text-[9px] font-bold uppercase py-0.5 px-2 border bg-emerald-50 border-emerald-300 text-emerald-800"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteEmailPermanently(activeEmail!.id)}
                          className="text-[9px] font-bold uppercase py-0.5 px-2 border bg-red-50 border-red-300 text-red-800"
                        >
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleTrashEmail(activeEmail!.id, true)}
                        className="text-[9px] font-bold uppercase py-0.5 px-2 border bg-red-50 border-red-200 text-red-700"
                      >
                        🗑️ Trash
                      </button>
                    )}
                  </div>
                </div>

                {/* Stack of Emails in the Thread */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {activeThread.map((mail, idx) => {
                    const isDraft = mail.isDraft;

                    return (
                      <div
                        key={mail.id}
                        className={`p-3 border text-[10px] space-y-2 ${isDraft ? 'border-dashed border-neutral-400 bg-amber-50/40' : 'border-neutral-200 bg-neutral-50'}`}
                      >
                        <div className="border-b border-neutral-200 pb-1.5 flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-neutral-950">
                                {mail.senderName}
                              </span>
                              <span className="text-neutral-500 text-[8.5px] font-mono">
                                &lt;{mail.sender}&gt;
                              </span>
                              {isDraft && (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[7.5px] px-1 font-bold rounded-sm uppercase">Draft</span>
                              )}
                            </div>
                            <span className="text-[8.5px] text-neutral-500 block mt-0.5">To: {mail.recipient}</span>
                            {mail.cc && <span className="text-[8.5px] text-neutral-500 block">CC: {mail.cc}</span>}
                            {mail.bcc && <span className="text-[8.5px] text-neutral-500 block">BCC: {mail.bcc}</span>}
                          </div>
                          <span className="text-[8px] text-neutral-400 font-mono shrink-0">{mail.date}</span>
                        </div>

                        <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap font-mono text-[9.5px]">{mail.body}</p>

                        {/* Attached Materials */}
                        {mail.attachments && mail.attachments.length > 0 && (
                          <div className="border-t border-neutral-200 pt-2 space-y-1">
                            <span className="text-[7.5px] uppercase font-black text-neutral-400 block tracking-wider">Secure Attachments</span>
                            <div className="flex flex-wrap gap-1.5">
                              {mail.attachments.map(att => (
                                <a
                                  key={att.name}
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    alert(`Simulated secure download triggered for file: ${att.name}`);
                                  }}
                                  className="flex items-center space-x-1 bg-white hover:bg-neutral-100 px-2 py-0.5 border border-neutral-200 text-[8.5px] font-mono transition-colors"
                                >
                                  <span>📎 {att.name}</span>
                                  <span className="text-neutral-400 text-[7.5px]">({att.size})</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {mail.enquiryId && (
                          <div className="border-t border-neutral-200 pt-2 flex justify-between items-center">
                            <span className="text-[8.5px] text-neutral-400 font-mono">Linked Deal Reference:</span>
                            <button
                              onClick={() => {
                                if (mail.enquiryId) {
                                  setSelectedEnquiryId(mail.enquiryId);
                                  setCurrentView('enquiry-detail');
                                  setActiveTab('Overview');
                                }
                              }}
                              className="text-neutral-900 hover:underline font-bold text-[8.5px] uppercase font-mono"
                            >
                              Go to Enquiry {mail.enquiryId} →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reply section trigger */}
                <div className="border-t border-neutral-200 pt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      const rootMail = activeThread[0] || activeEmail;
                      if (rootMail) {
                        const originalSubject = rootMail.subject;
                        const formattedSubject = originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`;

                        // Populate reply fields
                        setComposeTo(rootMail.sender);
                        setComposeCc('');
                        setComposeBcc('');
                        setComposeSubject(formattedSubject);
                        setComposeBody(`\n\n--- Original Message on ${rootMail.date} ---\n${rootMail.body}`);
                        setComposeEnquiry(rootMail.enquiryId || '');
                        setComposeAttachments([]);

                        // Open compose with proper parameters
                        setActiveDraftId(null);
                        setEmailComposeOpen(true);
                      }
                    }}
                    className="bg-neutral-950 hover:bg-neutral-800 text-white text-[9.5px] font-bold uppercase py-1 px-4 tracking-tight transition-colors"
                  >
                    💬 Quick Reply to Thread
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-neutral-400 border border-dashed border-neutral-200 bg-neutral-50 rounded-none flex flex-col items-center justify-center space-y-1.5">
                <span className="text-lg">📧</span>
                <span className="text-[10px] font-semibold uppercase tracking-tight">Select an operational dispatch thread to inspect</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}