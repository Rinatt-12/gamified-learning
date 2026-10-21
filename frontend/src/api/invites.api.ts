import apiClient from '../lib/axios';

export const invitesApi = {
  list: async () => {
    const { data } = await apiClient.get('/api/invites');
    return data;
  },

  create: async (input: { count: number; expiresInDays: number }) => {
    const { data } = await apiClient.post('/api/invites', input);
    return data;
  },

  revoke: async (id: string) => {
    const { data } = await apiClient.delete(`/api/invites/${id}`);
    return data;
  },
};