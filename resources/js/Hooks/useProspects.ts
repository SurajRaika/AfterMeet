import { useState, useCallback } from 'react';
import { Prospect } from '../Types';

export function useProspects(initialProspects: Prospect[] = []) {
    const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
    const [filter, setFilter] = useState<string>('');

    const addProspect = useCallback((prospect: Prospect) => {
        setProspects(prev => [prospect, ...prev]);
    }, []);

    const updateProspect = useCallback((id: number, updated: Partial<Prospect>) => {
        setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    }, []);

    const deleteProspect = useCallback((id: number) => {
        setProspects(prev => prev.filter(p => p.id !== id));
    }, []);

    const filteredProspects = prospects.filter(p =>
        p.contact_name.toLowerCase().includes(filter.toLowerCase()) ||
        p.company_name.toLowerCase().includes(filter.toLowerCase()) ||
        p.contact_email.toLowerCase().includes(filter.toLowerCase())
    );

    return {
        prospects: filteredProspects,
        allProspects: prospects,
        filter,
        setFilter,
        addProspect,
        updateProspect,
        deleteProspect,
        setProspects,
    };
}
