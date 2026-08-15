import axios from 'axios';

const api = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

export const fetchProspects = async () => {
    const response = await api.get('/api/prospects');
    return response.data;
};

export const fetchEmailThreads = async () => {
    const response = await api.get('/api/email-threads');
    return response.data;
};

export const triggerEmailSync = async () => {
    const response = await api.post('/api/emails/sync');
    return response.data;
};

export default api;
