import React from 'react';
import { Inbox, Users, FileText, GitMerge, BarChart2, Settings, Zap } from 'lucide-react';
import { NavigationTab } from '../Types';

interface SidebarProps {
    activeTab: NavigationTab;
    onTabChange: (tab: NavigationTab) => void;
}

const iconMap = {
    inbox: Inbox,
    prospects: Users,
    templates: FileText,
    blueprints: GitMerge,
    analytics: BarChart2,
    settings: Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const navItems: Array<{ id: NavigationTab; label: string }> = [
        { id: 'inbox', label: 'Inbox' },
        { id: 'prospects', label: 'Prospects' },
        { id: 'templates', label: 'Templates' },
        { id: 'blueprints', label: 'Blueprints' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800">
            <div className="p-5 flex items-center gap-3 border-b border-slate-800">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <Zap className="w-5 h-5" />
                </div>
                <div>
                    <span className="font-bold text-white text-lg tracking-tight">AfterMeet</span>
                    <span className="text-xs text-indigo-400 block font-medium">Outreach CRM</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
                    Main Menu
                </div>
                {navItems.map((item) => {
                    const Icon = iconMap[item.id];
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/60 rounded-lg p-3 text-xs text-slate-400">
                    <p className="font-semibold text-slate-200 mb-1">Inertia Monorepo</p>
                    <p>React Frontend Integrated with Laravel Wave Engine</p>
                </div>
            </div>
        </aside>
    );
};
