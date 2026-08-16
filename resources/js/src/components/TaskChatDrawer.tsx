import React from 'react';
import { User, Task } from '../types/crm';
import { USERS } from '../constants/initialData';

interface TaskChatDrawerProps {
  activeTaskId: string | null;
  activeTaskDetails: Task | null;
  setActiveTaskId: (id: string | null) => void;
  chatCommentText: string;
  setChatCommentText: (text: string) => void;
  handleAddComment: (taskId: string, text: string) => void;
  currentUser: User;
  triggerToast: (msg: string) => void;
}

export function TaskChatDrawer({
  activeTaskId,
  activeTaskDetails,
  setActiveTaskId,
  chatCommentText,
  setChatCommentText,
  handleAddComment,
  currentUser,
  triggerToast,
}: TaskChatDrawerProps) {
  if (!activeTaskId || !activeTaskDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/35 z-50 flex justify-end">
      {/* Backdrop close capture */}
      <div className="flex-1" onClick={() => setActiveTaskId(null)} />

      <div className="w-[450px] bg-white h-full border-l border-neutral-200 flex flex-col justify-between shadow-2xl p-4 space-y-4">

        {/* Drawer Header context */}
        <div className="border-b border-neutral-100 pb-3 flex justify-between items-start shrink-0">
          <div className="space-y-1">
            <span className="bg-neutral-900 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase">Task Chat Workspace</span>
            <h3 className="font-bold text-neutral-950 text-xs leading-snug">{activeTaskDetails.title}</h3>
            <span className="text-[9px] text-neutral-400 block">Task Reference ID: {activeTaskDetails.id} &bull; Enquiry: {activeTaskDetails.parentEnquiryId}</span>
          </div>
          <button
            onClick={() => setActiveTaskId(null)}
            className="text-neutral-400 hover:text-neutral-900 font-bold text-sm bg-neutral-100 hover:bg-neutral-200 w-5 h-5 flex items-center justify-center rounded-none"
          >
            ✕
          </button>
        </div>

        {/* Task Details Info Panel */}
        <div className="bg-neutral-50 p-2 border border-neutral-200 text-[10px] space-y-1.5 shrink-0">
          <div className="grid grid-cols-2 gap-1">
            <div>
              <span className="text-neutral-400 text-[8px] uppercase font-bold block">Assignee Target</span>
              <span className="font-bold text-neutral-800">{activeTaskDetails.assignee}</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[8px] uppercase font-bold block">Priority Rating</span>
              <span className="font-bold text-neutral-800">{activeTaskDetails.priority}</span>
            </div>
          </div>
          <div>
            <span className="text-neutral-400 text-[8px] uppercase font-bold block">Scope of Work</span>
            <p className="text-neutral-600 leading-relaxed">{activeTaskDetails.description}</p>
          </div>
          <div className="pt-1.5 border-t border-neutral-200 flex flex-wrap gap-1 items-center">
            <span className="text-neutral-400 text-[8px] uppercase font-bold">Collaborators:</span>
            {activeTaskDetails.watchers && activeTaskDetails.watchers.length > 0 ? (
              activeTaskDetails.watchers.map((w, index) => (
                <span key={index} className="bg-white border border-neutral-300 text-neutral-700 px-1 py-0.1 text-[8px] font-mono">
                  @{w}
                </span>
              ))
            ) : (
              <span className="text-neutral-500 italic text-[9px]">Only assigned handlers are watching. Use @mention to invite team members.</span>
            )}
          </div>
        </div>

        {/* Internal Task Chat History Feed */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 border border-neutral-200 p-2 space-y-3 min-h-0">
          <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block border-b pb-1">Internal task stream logs</span>

          {activeTaskDetails.comments && activeTaskDetails.comments.length > 0 ? (
            activeTaskDetails.comments.map((comment) => (
              <div key={comment.id} className="bg-white p-2 border border-neutral-200 space-y-1">
                <div className="flex justify-between items-center border-b pb-0.5">
                  <span className="font-bold text-neutral-900 text-[10px]">
                    {comment.author}
                  </span>
                  <span className="text-[8px] text-neutral-400">{comment.date}</span>
                </div>
                <p className="text-neutral-700 leading-relaxed text-[10px] whitespace-pre-wrap">
                  {comment.text.split(/(\s+)/).map((word, i) => {
                    if (word.startsWith('@')) {
                      return <strong key={i} className="text-blue-600 font-bold bg-blue-5 font-mono px-0.5">{word}</strong>;
                    }
                    return word;
                  })}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400 italic">
              No operational chats logged. Initiate communication by typing below or mentioning @Member to loop them in.
            </div>
          )}
        </div>

        {/* Chat Input form area with Mention Suggester helpers */}
        <div className="space-y-2 shrink-0">

          {/* Mention Suggestion panel helper */}
          <div className="flex flex-wrap gap-1 items-center justify-between">
            <span className="text-[8px] text-neutral-400 uppercase font-bold">Quick Mention Invite:</span>
            <div className="flex flex-wrap gap-1">
              {Object.values(USERS).filter(u => u.name !== currentUser.name).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setChatCommentText(chatCommentText + ` @${u.name} `);
                    triggerToast(`Appended mention marker for @${u.name}`);
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[8px] px-1.5 py-0.5 rounded-none font-medium transition-colors"
                >
                  +{u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Message submit editor container */}
          <div className="flex space-x-1.5">
            <textarea
              value={chatCommentText}
              onChange={(e) => setChatCommentText(e.target.value)}
              placeholder="Type an internal update here... Use @Name to invite team members."
              rows={2}
              className="w-full bg-white border border-neutral-300 p-1.5 text-[10px] focus:outline-none focus:border-neutral-900 resize-none font-sans"
            />
            <button
              onClick={() => handleAddComment(activeTaskDetails.id, chatCommentText)}
              className="bg-black text-white hover:bg-neutral-850 font-bold px-3 py-1 uppercase text-[9px] shrink-0"
            >
              Send
            </button>
          </div>
          <span className="text-[8px] text-neutral-400 block italic leading-none">Collaborators mentioned will automatically have this task populated in their personal tasks inbox context.</span>
        </div>

      </div>
    </div>
  );
}
