import React, { useState } from 'react';
import { Mail, Send, Star, Paperclip, Search, ArrowRight } from 'lucide-react';
import { EmailThread } from '../Types';

interface InboxViewProps {
    threads?: EmailThread[];
}

export const InboxView: React.FC<InboxViewProps> = ({ threads = [] }) => {
    const [selectedThread, setSelectedThread] = useState<EmailThread | null>(threads[0] || null);
    const [replyText, setReplyText] = useState('');

    const defaultThreads: EmailThread[] = [
        {
            id: 1,
            subject: 'Re: Follow-up regarding AfterMeet CRM integration',
            last_message_at: '10:42 AM',
            unread_count: 1,
            prospect: {
                id: 101,
                contact_name: 'Sarah Connor',
                contact_email: 'sarah@cyberdyne.com',
                company_name: 'Cyberdyne Systems',
                status: 'qualified',
            },
            messages: [
                {
                    id: 1001,
                    sender: 'sarah@cyberdyne.com',
                    recipient: 'me@crm.com',
                    subject: 'Re: Follow-up regarding AfterMeet CRM integration',
                    body: 'Hi team, thanks for sending over the proposal! We are reviewing it internally.',
                    received_at: '10:42 AM',
                    is_read: false,
                },
            ],
        },
        {
            id: 2,
            subject: 'Meeting Confirmation - Enterprise Outreach Demo',
            last_message_at: 'Yesterday',
            unread_count: 0,
            prospect: {
                id: 102,
                contact_name: 'John Doe',
                contact_email: 'john@acme.corp',
                company_name: 'Acme Corp',
                status: 'contacted',
            },
            messages: [
                {
                    id: 1002,
                    sender: 'john@acme.corp',
                    recipient: 'me@crm.com',
                    subject: 'Meeting Confirmation - Enterprise Outreach Demo',
                    body: 'Looking forward to our product demo tomorrow at 2 PM EST.',
                    received_at: 'Yesterday',
                    is_read: true,
                },
            ],
        },
    ];

    const displayThreads = threads.length > 0 ? threads : defaultThreads;
    const active = selectedThread || displayThreads[0];

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-900">
            {/* Thread List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">Inbox</h2>
                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
                        {displayThreads.length} Threads
                    </span>
                </div>

                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter messages..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {displayThreads.map((thread) => {
                        const isSelected = active?.id === thread.id;
                        return (
                            <div
                                key={thread.id}
                                onClick={() => setSelectedThread(thread)}
                                className={`p-4 cursor-pointer transition ${
                                    isSelected
                                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-600'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                                        {thread.prospect?.contact_name || thread.subject}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{thread.last_message_at}</span>
                                </div>
                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate mb-1">
                                    {thread.subject}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {thread.messages?.[0]?.body || 'No preview available'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Message Pane */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                {active ? (
                    <>
                        <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {active.subject}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>From: <strong className="text-gray-700 dark:text-gray-300">{active.prospect?.contact_email || 'Contact'}</strong></span>
                                    <span>•</span>
                                    <span>Company: <strong className="text-gray-700 dark:text-gray-300">{active.prospect?.company_name || 'N/A'}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {active.messages?.map((msg) => (
                                <div key={msg.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                                {msg.sender.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{msg.sender}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{msg.received_at}</span>
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {msg.body}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Form */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                            <div className="relative">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your reply..."
                                    rows={3}
                                    className="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition">
                                        <span>Send Reply</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Mail className="w-12 h-12 mb-2 stroke-1" />
                        <p className="text-sm">Select a thread to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};
