import apiClient from '../lib/axios';

export const teamsApi = {
  list: async () => {
    const { data } = await apiClient.get('/api/teams');
    return data;
  },

  myTeam: async () => {
    const { data } = await apiClient.get('/api/teams/my-team');
    return data;
  },

  create: async (input: { name: string; description?: string }) => {
    const { data } = await apiClient.post('/api/teams', input);
    return data;
  },

  join: async (teamId: string) => {
    const { data } = await apiClient.post(`/api/teams/${teamId}/join`);
    return data;
  },

  leave: async () => {
    const { data } = await apiClient.post('/api/teams/leave');
    return data;
  },
};