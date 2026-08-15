import { NavigationTab, Prospect } from '../Types';

export const NAVIGATION_ITEMS: Array<{ id: NavigationTab; label: string; icon: string }> = [
    { id: 'inbox', label: 'Inbox', icon: 'Inbox' },
    { id: 'prospects', label: 'Prospects', icon: 'Users' },
    { id: 'templates', label: 'Email Templates', icon: 'FileText' },
    { id: 'blueprints', label: 'Sequence Blueprints', icon: 'GitMerge' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart2' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const PROSPECT_STATUSES: Record<Prospect['status'], { label: string; bgClass: string; textClass: string }> = {
    lead: { label: 'New Lead', bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-800 dark:text-blue-300' },
    contacted: { label: 'Contacted', bgClass: 'bg-yellow-100 dark:bg-yellow-900/40', textClass: 'text-yellow-800 dark:text-yellow-300' },
    qualified: { label: 'Qualified', bgClass: 'bg-purple-100 dark:bg-purple-900/40', textClass: 'text-purple-800 dark:text-purple-300' },
    proposal: { label: 'Proposal Sent', bgClass: 'bg-indigo-100 dark:bg-indigo-900/40', textClass: 'text-indigo-800 dark:text-indigo-300' },
    won: { label: 'Closed Won', bgClass: 'bg-green-100 dark:bg-green-900/40', textClass: 'text-green-800 dark:text-green-300' },
    lost: { label: 'Closed Lost', bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-800 dark:text-gray-300' },
};
