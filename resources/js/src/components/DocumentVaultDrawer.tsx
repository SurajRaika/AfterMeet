import React, { useState } from 'react';
import { User, DocumentRecord, DocumentVersion, DocumentWorkItemLink, Task } from '../types/crm';
import { USERS } from '../constants/initialData';
import { ChevronDown, ChevronUp, FileText, Upload, Link as LinkIcon, Share2, History, X } from 'lucide-react';

interface DocumentVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEnquiryId: string;
  documents: DocumentRecord[];
  documentVersions: DocumentVersion[];
  documentWorkItemLinks: DocumentWorkItemLink[];
  tasks: Task[];
  currentUser: User;
  handleUploadDocument: (
    title: string,
    filePath: string,
    enquiryId: string,
    workItemId?: string,
    owningDept?: string,
    sharedWith?: { users?: string[]; departments?: string[] },
    notes?: string
  ) => DocumentRecord;
  handleUploadNewDocumentVersion: (
    documentId: string,
    filePath: string,
    notes?: string
  ) => void;
  handleLinkDocumentToRequest: (
    documentId: string,
    workItemId: string
  ) => void;
  handleShareDocument: (
    documentId: string,
    sharedUsers?: string[],
    sharedDepartments?: string[]
  ) => void;
  triggerToast: (msg: string) => void;
}

export function DocumentVaultDrawer({
  isOpen,
  onClose,
  selectedEnquiryId,
  documents,
  documentVersions,
  documentWorkItemLinks,
  tasks,
  currentUser,
  handleUploadDocument,
  handleUploadNewDocumentVersion,
  handleLinkDocumentToRequest,
  handleShareDocument,
  triggerToast,
}: DocumentVaultDrawerProps) {
  if (!isOpen) return null;

  // Filter documents scoped to current enquiry_id
  const enquiryDocs = documents.filter(d => d.enquiryId === selectedEnquiryId);

  // Available work_items (tasks/requests) for this enquiry
  const enquiryTasks = tasks.filter(t => t.parentEnquiryId === selectedEnquiryId || t.linkedRecord === selectedEnquiryId);

  // Vault search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Standalone document upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [newOwningDept, setNewOwningDept] = useState(currentUser.department || 'Sales');
  const [newWorkItemId, setNewWorkItemId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Optional explicit share section in upload form
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([]);
  const [selectedShareDepts, setSelectedShareDepartments] = useState<string[]>([]);

  // Expanded version history toggle per document ID
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});

  // Inline action forms per document ID
  const [newVersionDocId, setNewVersionDocId] = useState<string | null>(null);
  const [verFilePath, setVerFilePath] = useState('');
  const [verNotes, setVerNotes] = useState('');

  const [linkDocId, setLinkDocId] = useState<string | null>(null);
  const [linkWorkItemId, setLinkWorkItemId] = useState('');

  const [shareDocId, setShareDocId] = useState<string | null>(null);
  const [shareUser, setShareUser] = useState('');

  const toggleVersionExpand = (docId: string) => {
    setExpandedVersions(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleCreateDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) {
      triggerToast('Please provide a file name or path.');
      return;
    }

    const title = newTitle.trim() || newFilePath.trim();
    const sharedWith = selectedShareUsers.length > 0 || selectedShareDepts.length > 0
      ? { users: selectedShareUsers, departments: selectedShareDepts }
      : undefined;

    handleUploadDocument(
      title,
      newFilePath.trim(),
      selectedEnquiryId,
      newWorkItemId || undefined,
      newOwningDept,
      sharedWith,
      newNotes.trim() || undefined
    );

    // Reset form
    setNewTitle('');
    setNewFilePath('');
    setNewWorkItemId('');
    setNewNotes('');
    setShowShareOptions(false);
    setSelectedShareUsers([]);
    setSelectedShareDepartments([]);
    setShowUploadForm(false);
  };

  const handleUploadNewVerSubmit = (docId: string) => {
    if (!verFilePath.trim()) {
      triggerToast('Please provide a file name for the new version.');
      return;
    }
    handleUploadNewDocumentVersion(docId, verFilePath.trim(), verNotes.trim() || undefined);
    setNewVersionDocId(null);
    setVerFilePath('');
    setVerNotes('');
  };

  const handleLinkSubmit = (docId: string) => {
    if (!linkWorkItemId) {
      triggerToast('Please select a request to link.');
      return;
    }
    handleLinkDocumentToRequest(docId, linkWorkItemId);
    setLinkDocId(null);
    setLinkWorkItemId('');
  };

  const handleShareSubmit = (docId: string) => {
    if (!shareUser) return;
    handleShareDocument(docId, [shareUser]);
    triggerToast(`Document shared with ${shareUser}`);
    setShareDocId(null);
    setShareUser('');
  };

  // Filter docs matching search term
  const filteredDocs = enquiryDocs.filter(d => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const currentVer = documentVersions.find(v => v.id === d.currentVersionId);
    return (
      d.title.toLowerCase().includes(q) ||
      d.owningDepartmentId.toLowerCase().includes(q) ||
      d.uploadedBy.toLowerCase().includes(q) ||
      (currentVer && currentVer.filePath.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 bg-black/35 z-50 flex justify-end">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      <div className="w-[500px] bg-white h-full border-l border-neutral-200 flex flex-col justify-between shadow-2xl p-4 space-y-4">

        {/* Drawer Header */}
        <div className="border-b border-neutral-200 pb-3 flex justify-between items-start shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-neutral-900 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-wider">
                Document Vault
              </span>
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2">
                Scoped to {selectedEnquiryId}
              </span>
            </div>
            <h3 className="font-bold text-neutral-950 text-xs">Repository & Version Control</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 font-bold text-sm bg-neutral-100 hover:bg-neutral-200 w-6 h-6 flex items-center justify-center rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar & Search */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Search documents by title, uploader, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 p-1.5 text-[10px] focus:outline-none focus:border-neutral-900 flex-1 font-sans"
            />
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-neutral-950 hover:bg-neutral-800 text-white text-[9px] uppercase font-bold px-2.5 py-1.5 flex items-center space-x-1 shrink-0"
            >
              <Upload className="w-3 h-3" />
              <span>{showUploadForm ? 'Cancel Upload' : '+ Upload Document'}</span>
            </button>
          </div>

          {/* Standalone Upload Form */}
          {showUploadForm && (
            <form onSubmit={handleCreateDocumentSubmit} className="bg-neutral-50 p-3 border border-neutral-300 space-y-2.5 text-[10px]">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="font-bold text-neutral-900 uppercase text-[9px]">Upload New Document Record</span>
                <span className="text-[8px] text-neutral-500">Auto-version v1.0</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Document Title / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Phytosanitary Certificate"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-neutral-300 p-1 text-[10px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">File Name / Path <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Phytosanitary_Cert_v1.pdf"
                    value={newFilePath}
                    onChange={(e) => setNewFilePath(e.target.value)}
                    required
                    className="w-full bg-white border border-neutral-300 p-1 text-[10px] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Owning Department</label>
                  <select
                    value={newOwningDept}
                    onChange={(e) => setNewOwningDept(e.target.value)}
                    className="w-full bg-white border border-neutral-300 p-1 text-[10px] focus:outline-none"
                  >
                    <option value="Sales">Sales Desk</option>
                    <option value="Costing">Costing Desk</option>
                    <option value="Sampling">Sampling Desk</option>
                    <option value="Logistics">Logistics Desk</option>
                    <option value="Compliance">Compliance Desk</option>
                    <option value="HR">HR Desk</option>
                    <option value="Accounting">Accounting Desk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Link to Request / Work Item (Optional)</label>
                  <select
                    value={newWorkItemId}
                    onChange={(e) => setNewWorkItemId(e.target.value)}
                    className="w-full bg-white border border-neutral-300 p-1 text-[10px] focus:outline-none"
                  >
                    <option value="">-- Standalone (No Request Link) --</option>
                    {enquiryTasks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title} ({t.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Version Notes</label>
                <input
                  type="text"
                  placeholder="Optional description of this version..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-1 text-[10px] focus:outline-none"
                />
              </div>

              {/* Optional Collapsed "Share with others" Picker */}
              <div className="border-t border-neutral-200 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="text-[8px] uppercase font-bold text-neutral-600 hover:text-neutral-900 flex items-center space-x-1"
                >
                  <Share2 className="w-2.5 h-2.5" />
                  <span>{showShareOptions ? '▼ Hide Share Options' : '► Share with others (Optional)'}</span>
                </button>

                {showShareOptions && (
                  <div className="mt-1.5 bg-white p-2 border border-neutral-200 space-y-1.5 text-[9px]">
                    <span className="text-[8px] text-neutral-500 block">
                      Note: Document is automatically visible to your department ancestors and the requester. Use this optional field only for explicit grants.
                    </span>
                    <div>
                      <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Grant Explicit User Access</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value && !selectedShareUsers.includes(e.target.value)) {
                            setSelectedShareUsers([...selectedShareUsers, e.target.value]);
                          }
                        }}
                        className="w-full bg-neutral-50 border p-1 text-[9px]"
                      >
                        <option value="">-- Choose User to Share With --</option>
                        {Object.values(USERS).filter(u => u.name !== currentUser.name).map(u => (
                          <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                      {selectedShareUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedShareUsers.map(u => (
                            <span key={u} className="bg-neutral-200 text-neutral-800 text-[8px] px-1 py-0.2 font-mono flex items-center space-x-1">
                              <span>{u}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedShareUsers(selectedShareUsers.filter(x => x !== u))}
                                className="text-red-600 font-bold ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-1 text-[9px]"
              >
                Upload Document to Vault
              </button>
            </form>
          )}
        </div>

        {/* Documents Vault List */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 border border-neutral-200 p-2.5 space-y-3 min-h-0">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">
              Enquiry Documents ({filteredDocs.length})
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">
              Centralized Version History
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 italic text-[10px] space-y-1">
              <FileText className="w-8 h-8 mx-auto text-neutral-300 stroke-[1.5]" />
              <p>No documents uploaded for Enquiry {selectedEnquiryId} yet.</p>
              <p className="text-[9px] text-neutral-500">Click "+ Upload Document" above or upload directly within department request threads.</p>
            </div>
          ) : (
            filteredDocs.map(doc => {
              // Get all versions for this document
              const allVersions = documentVersions
                .filter(v => v.documentId === doc.id)
                .sort((a, b) => b.versionNumber - a.versionNumber);

              // Current active version
              const currentVersion = allVersions.find(v => v.id === doc.currentVersionId) || allVersions[0];

              // Links for this document
              const links = documentWorkItemLinks.filter(l => l.documentId === doc.id);

              const isExpanded = !!expandedVersions[doc.id];

              return (
                <div key={doc.id} className="bg-white border border-neutral-250 p-3 space-y-2 text-[10px] shadow-2xs">

                  {/* Header info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                        <h4 className="font-bold text-neutral-950 text-[11px] leading-tight">{doc.title}</h4>
                      </div>
                      <span className="text-[8px] text-neutral-400 block mt-0.5">
                        Doc ID: {doc.id} &bull; Created: {doc.createdAt} &bull; Uploader: {doc.uploadedBy}
                      </span>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className="bg-neutral-900 text-white font-mono font-bold text-[8px] px-1.5 py-0.2 uppercase">
                        Dept: {doc.owningDepartmentId}
                      </span>
                      {currentVersion && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold text-[8px] px-1.5 py-0.2">
                          Latest: v{currentVersion.versionNumber}.0
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current Active File Info */}
                  {currentVersion && (
                    <div className="bg-neutral-50 border border-neutral-200 p-2 text-[9.5px] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-neutral-900 truncate max-w-[280px]">
                          📎 {currentVersion.filePath}
                        </span>
                        <span className="text-[8px] text-neutral-500 font-mono">
                          v{currentVersion.versionNumber}.0
                        </span>
                      </div>
                      {currentVersion.notes && (
                        <p className="text-[8.5px] text-neutral-600 italic">
                          Notes: "{currentVersion.notes}"
                        </p>
                      )}
                      <div className="text-[8px] text-neutral-400 flex justify-between pt-0.5 border-t border-neutral-200">
                        <span>Uploaded by: <strong>{currentVersion.uploadedBy}</strong></span>
                        <span>Date: {currentVersion.createdAt}</span>
                      </div>
                    </div>
                  )}

                  {/* Linked Work Items (Requests) */}
                  <div className="pt-1 border-t border-neutral-100 flex flex-wrap gap-1 items-center">
                    <span className="text-[8px] uppercase font-bold text-neutral-400 flex items-center space-x-1">
                      <LinkIcon className="w-2.5 h-2.5" />
                      <span>Linked Requests:</span>
                    </span>
                    {links.length > 0 ? (
                      links.map(link => {
                        const linkedTask = tasks.find(t => t.id === link.workItemId);
                        return (
                          <span key={link.id} className="bg-blue-50 text-blue-900 border border-blue-200 text-[8px] font-mono px-1 py-0.2">
                            {link.workItemId} {linkedTask ? `(${linkedTask.department})` : ''}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[8.5px] text-neutral-400 italic">Standalone (Unlinked)</span>
                    )}
                  </div>

                  {/* Explicit Shares if present */}
                  {doc.sharedWith && (doc.sharedWith.users?.length || doc.sharedWith.departments?.length) ? (
                    <div className="text-[8px] text-neutral-500 bg-neutral-50 p-1 border">
                      Shared with: {doc.sharedWith.users?.join(', ')} {doc.sharedWith.departments?.join(', ')}
                    </div>
                  ) : null}

                  {/* Control Buttons */}
                  <div className="pt-1 flex flex-wrap gap-1.5 items-center justify-between border-t border-neutral-100">
                    <button
                      onClick={() => toggleVersionExpand(doc.id)}
                      className="text-[8.5px] font-bold text-neutral-600 hover:text-neutral-900 uppercase flex items-center space-x-1 bg-neutral-100 hover:bg-neutral-200 px-1.5 py-0.5"
                    >
                      <History className="w-2.5 h-2.5" />
                      <span>Version History ({allVersions.length})</span>
                      {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setNewVersionDocId(newVersionDocId === doc.id ? null : doc.id);
                          setVerFilePath('');
                          setVerNotes('');
                        }}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-[8px] font-bold uppercase px-2 py-0.5"
                      >
                        + New Version
                      </button>

                      <button
                        onClick={() => {
                          setLinkDocId(linkDocId === doc.id ? null : doc.id);
                          setLinkWorkItemId('');
                        }}
                        className="bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-[8px] font-bold uppercase px-2 py-0.5"
                      >
                        Link Request
                      </button>

                      <button
                        onClick={() => {
                          setShareDocId(shareDocId === doc.id ? null : doc.id);
                          setShareUser('');
                        }}
                        className="bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-[8px] font-bold uppercase px-1.5 py-0.5"
                        title="Share Document"
                      >
                        <Share2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Form: Upload New Version */}
                  {newVersionDocId === doc.id && (
                    <div className="bg-neutral-50 p-2.5 border border-neutral-300 space-y-2 mt-2 text-[9.5px]">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-bold text-neutral-900 uppercase text-[8.5px]">
                          Upload New Version for "{doc.title}"
                        </span>
                        <span className="text-[8px] text-amber-700 font-bold bg-amber-50 px-1 border border-amber-200">
                          Next: v{(allVersions[0]?.versionNumber || 1) + 1}.0
                        </span>
                      </div>
                      <p className="text-[8px] text-neutral-500">
                        Uploading a new version preserves all prior versions ({allVersions.length}) in full history without overwriting.
                      </p>
                      <div>
                        <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">New File Name / Path</label>
                        <input
                          type="text"
                          placeholder="e.g. Phytosanitary_Cert_v2_signed.pdf"
                          value={verFilePath}
                          onChange={(e) => setVerFilePath(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-1 text-[9.5px] font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase text-neutral-500 mb-0.5">Version Change Notes</label>
                        <input
                          type="text"
                          placeholder="What changed in this version?"
                          value={verNotes}
                          onChange={(e) => setVerNotes(e.target.value)}
                          className="w-full bg-white border border-neutral-300 p-1 text-[9.5px] focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => setNewVersionDocId(null)}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[8px] font-bold px-2 py-0.5 uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUploadNewVerSubmit(doc.id)}
                          className="bg-neutral-950 hover:bg-neutral-800 text-white text-[8px] font-bold px-2.5 py-0.5 uppercase"
                        >
                          Save New Version
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Form: Link to Request */}
                  {linkDocId === doc.id && (
                    <div className="bg-neutral-50 p-2.5 border border-neutral-300 space-y-2 mt-2 text-[9.5px]">
                      <span className="font-bold text-neutral-900 uppercase text-[8.5px] block border-b pb-1">
                        Link "{doc.title}" to another Request
                      </span>
                      <select
                        value={linkWorkItemId}
                        onChange={(e) => setLinkWorkItemId(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-1 text-[9.5px] focus:outline-none"
                      >
                        <option value="">-- Choose Request / Work Item --</option>
                        {enquiryTasks.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.id}: {t.title} ({t.department})
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => setLinkDocId(null)}
                          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[8px] font-bold px-2 py-0.5 uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLinkSubmit(doc.id)}
                          className="bg-neutral-950 text-white text-[8px] font-bold px-2.5 py-0.5 uppercase"
                        >
                          Confirm Link
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Form: Share Document */}
                  {shareDocId === doc.id && (
                    <div className="bg-neutral-50 p-2.5 border border-neutral-300 space-y-2 mt-2 text-[9.5px]">
                      <span className="font-bold text-neutral-900 uppercase text-[8.5px] block border-b pb-1">
                        Share "{doc.title}"
                      </span>
                      <select
                        value={shareUser}
                        onChange={(e) => setShareUser(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-1 text-[9.5px] focus:outline-none"
                      >
                        <option value="">-- Choose Member to Share With --</option>
                        {Object.values(USERS).filter(u => u.name !== currentUser.name).map(u => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.role} - {u.department})
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => setShareDocId(null)}
                          className="bg-neutral-200 text-neutral-800 text-[8px] font-bold px-2 py-0.5 uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareSubmit(doc.id)}
                          className="bg-neutral-950 text-white text-[8px] font-bold px-2.5 py-0.5 uppercase"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Version History Accordion */}
                  {isExpanded && (
                    <div className="bg-neutral-100/70 border border-neutral-250 p-2 space-y-1.5 mt-2 text-[9px]">
                      <span className="text-[8px] uppercase font-bold text-neutral-500 block border-b pb-0.5">
                        Complete Version Audit History ({allVersions.length} versions)
                      </span>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {allVersions.map((ver) => {
                          const isCurrent = ver.id === doc.currentVersionId;
                          return (
                            <div
                              key={ver.id}
                              className={`p-1.5 border text-[8.5px] space-y-0.5 ${
                                isCurrent ? 'bg-white border-emerald-300' : 'bg-white/80 border-neutral-200'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-neutral-900">
                                  v{ver.versionNumber}.0 &mdash; {ver.filePath}
                                </span>
                                {isCurrent ? (
                                  <span className="text-[7.5px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1 border border-emerald-200 uppercase">
                                    Active Current
                                  </span>
                                ) : (
                                  <span className="text-[7.5px] font-mono text-neutral-400">
                                    Historical Version
                                  </span>
                                )}
                              </div>
                              {ver.notes && (
                                <p className="text-neutral-600 italic">Notes: "{ver.notes}"</p>
                              )}
                              <div className="flex justify-between text-[7.5px] text-neutral-400 border-t border-neutral-100 pt-0.5">
                                <span>Uploaded by: {ver.uploadedBy}</span>
                                <span>Timestamp: {ver.createdAt}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
