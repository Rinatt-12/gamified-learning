import apiClient from '../lib/axios';

export const usersApi = {
  me: async () => {
    const { data } = await apiClient.get('/api/users/me');
    return data;
  },

  updateMe: async (input: any) => {
    const { data } = await apiClient.put('/api/users/me', input);
    return data;
  },
};