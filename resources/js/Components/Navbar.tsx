import React from 'react';
import { Search, Bell, RefreshCw, User as UserIcon } from 'lucide-react';
import { User } from '../Types';

interface NavbarProps {
    user?: User;
    onSyncEmails?: () => void;
    isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onSyncEmails, isSyncing }) => {
    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search prospects, email threads, templates..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {onSyncEmails && (
                    <button
                        onClick={onSyncEmails}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                        title="Sync Emails with Nylas"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>Sync Emails</span>
                    </button>
                )}

                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="hidden md:block text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user?.name || 'CRM User'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email || 'user@example.com'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
