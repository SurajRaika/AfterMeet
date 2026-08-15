import React, { useState } from 'react';
import { Plus, UserPlus, Filter, MoreHorizontal, Trash2, Edit3, Mail } from 'lucide-react';
import { Prospect } from '../Types';
import { PROSPECT_STATUSES } from '../Constants';

interface ProspectsBoardProps {
    initialProspects?: Prospect[];
}

export const ProspectsBoard: React.FC<ProspectsBoardProps> = ({ initialProspects = [] }) => {
    const defaultProspects: Prospect[] = [
        { id: 1, contact_name: 'Alex Morgan', contact_email: 'alex@techcorp.io', contact_role: 'VP Sales', company_name: 'TechCorp', status: 'lead' },
        { id: 2, contact_name: 'Sarah Connor', contact_email: 'sarah@cyberdyne.com', contact_role: 'CTO', company_name: 'Cyberdyne Systems', status: 'qualified' },
        { id: 3, contact_name: 'David Miller', contact_email: 'david@innovate.co', contact_role: 'Head of Growth', company_name: 'Innovate Co', status: 'contacted' },
        { id: 4, contact_name: 'Elena Rostova', contact_email: 'elena@nexus.dev', contact_role: 'CEO', company_name: 'Nexus Dev', status: 'proposal' },
    ];

    const [prospects, setProspects] = useState<Prospect[]>(
        initialProspects.length > 0 ? initialProspects : defaultProspects
    );

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProspect, setNewProspect] = useState<Partial<Prospect>>({
        contact_name: '',
        contact_email: '',
        company_name: '',
        contact_role: '',
        status: 'lead',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProspect.contact_name || !newProspect.contact_email) return;

        const created: Prospect = {
            id: Date.now(),
            contact_name: newProspect.contact_name || '',
            contact_email: newProspect.contact_email || '',
            company_name: newProspect.company_name || 'N/A',
            contact_role: newProspect.contact_role || 'Manager',
            status: (newProspect.status as Prospect['status']) || 'lead',
        };

        setProspects([created, ...prospects]);
        setIsAddModalOpen(false);
        setNewProspect({ contact_name: '', contact_email: '', company_name: '', contact_role: '', status: 'lead' });
    };

    const handleDelete = (id: number) => {
        setProspects(prospects.filter(p => p.id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Prospect Pipeline</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage, filter, and sequence target prospect accounts.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Prospect</span>
                </button>
            </div>

            {/* Prospects Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-4 font-semibold">Contact Name</th>
                            <th className="py-3 px-4 font-semibold">Company</th>
                            <th className="py-3 px-4 font-semibold">Role</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
                        {prospects.map((prospect) => {
                            const badge = PROSPECT_STATUSES[prospect.status] || PROSPECT_STATUSES.lead;
                            return (
                                <tr key={prospect.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">{prospect.contact_name}</div>
                                        <div className="text-[11px] text-gray-400">{prospect.contact_email}</div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
                                        {prospect.company_name}
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">
                                        {prospect.contact_role || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bgClass} ${badge.textClass}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => handleDelete(prospect.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title="Delete Prospect"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add Prospect Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add New Prospect</h2>
                        <form onSubmit={handleAdd} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newProspect.contact_name}
                                    onChange={(e) => setNewProspect({ ...newProspect, contact_name: e.target.value })}
                                    className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newProspect.contact_email}
                                    onChange={(e) => setNewProspect({ ...newProspect, contact_email: e.target.value })}
                                    className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={newProspect.company_name}
                                    onChange={(e) => setNewProspect({ ...newProspect, company_name: e.target.value })}
                                    className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={newProspect.contact_role}
                                    onChange={(e) => setNewProspect({ ...newProspect, contact_role: e.target.value })}
                                    className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                                >
                                    Save Prospect
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
