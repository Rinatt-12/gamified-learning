import apiClient from '../lib/axios';

export const gamificationApi = {
  myStats: async () => {
    const { data } = await apiClient.get('/api/gamification/me');
    return data;
  },
};