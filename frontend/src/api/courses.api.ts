import apiClient from '../lib/axios';

export const coursesApi = {
  list: async () => {
    const { data } = await apiClient.get('/api/courses');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/api/courses/${id}`);
    return data;
  },

  getLevel: async (levelId: string) => {
    const { data } = await apiClient.get(`/api/courses/levels/${levelId}`);
    return data;
  },
};