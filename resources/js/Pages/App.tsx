import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Sidebar } from '../Components/Sidebar';
import { Navbar } from '../Components/Navbar';
import { InboxView } from '../Components/InboxView';
import { ProspectsBoard } from '../Components/ProspectsBoard';
import { NavigationTab, User, Prospect, EmailThread } from '../Types';
import { FileText, GitMerge, BarChart2, Settings as SettingsIcon } from 'lucide-react';

interface AppProps {
    user?: User;
    prospects?: Prospect[];
    emailThreads?: EmailThread[];
}

export default function App({ user, prospects = [], emailThreads = [] }: AppProps) {
    const [activeTab, setActiveTab] = useState<NavigationTab>('inbox');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1200);
    };

    return (
        <>
            <Head title="AfterMeet CRM Dashboard" />
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar user={user} onSyncEmails={handleSync} isSyncing={isSyncing} />
                    <main className="flex-1 overflow-y-auto">
                        {activeTab === 'inbox' && <InboxView threads={emailThreads} />}
                        {activeTab === 'prospects' && <ProspectsBoard initialProspects={prospects} />}
                        {activeTab === 'templates' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                    <h1 className="text-xl font-bold">Email Templates</h1>
                                </div>
                                <p className="text-xs text-gray-500 mb-6">Manage reusable outreach email templates with placeholders like &#123;company_name&#125;.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h3 className="font-bold text-sm mb-1">Cold Outreach - Discovery</h3>
                                        <p className="text-xs text-gray-500 mb-3">Subject: Quick question regarding &#123;company_name&#125;</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">Hi &#123;contact_name&#125;, I noticed your team at &#123;company_name&#125; is scaling outreach...</p>
                                    </div>
                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h3 className="font-bold text-sm mb-1">Follow Up - Demo Reconnection</h3>
                                        <p className="text-xs text-gray-500 mb-3">Subject: Re: Next steps for &#123;company_name&#125;</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">Hi &#123;contact_name&#125;, following up on our recent call to see if you had any questions...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'blueprints' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <GitMerge className="w-6 h-6 text-indigo-600" />
                                    <h1 className="text-xl font-bold">Outreach Blueprints</h1>
                                </div>
                                <p className="text-xs text-gray-500 mb-6">Automated multi-step outreach cadence and waiting rules.</p>
                                <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <h3 className="font-bold text-sm mb-2">High Touch Enterprise Cadence</h3>
                                    <ol className="list-decimal list-inside text-xs space-y-2 text-gray-600 dark:text-gray-300">
                                        <li>Step 1: Send Cold Outreach Discovery email immediately.</li>
                                        <li>Step 2: Wait 3 days. Send follow-up email if no reply.</li>
                                        <li>Step 3: Wait 5 days. Trigger phone call reminder task.</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                        {activeTab === 'analytics' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <BarChart2 className="w-6 h-6 text-indigo-600" />
                                    <h1 className="text-xl font-bold">Outreach Performance</h1>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 font-medium">Total Contacted</div>
                                        <div className="text-2xl font-bold text-indigo-600 mt-1">128</div>
                                    </div>
                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 font-medium">Open Rate</div>
                                        <div className="text-2xl font-bold text-green-600 mt-1">64.2%</div>
                                    </div>
                                    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 font-medium">Reply Rate</div>
                                        <div className="text-2xl font-bold text-blue-600 mt-1">28.5%</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'settings' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <SettingsIcon className="w-6 h-6 text-indigo-600" />
                                    <h1 className="text-xl font-bold">Monorepo Integration Settings</h1>
                                </div>
                                <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                    <p><strong>Framework Engine:</strong> Laravel 12 + Inertia.js (React 19 + TypeScript)</p>
                                    <p><strong>Nylas OAuth & Webhook API:</strong> Configured & Local local DB Sync Enabled</p>
                                    <p><strong>Theme Asset Bundler:</strong> Vite + Tailwind CSS</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
