import apiClient from '../lib/axios';

export const tasksApi = {
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/api/tasks/${id}`);
    return data;
  },

  submit: async (id: string, answer: string, timeSpent?: number) => {
    const { data } = await apiClient.post(`/api/tasks/${id}/attempt`, {
      answer,
      timeSpent,
    });
    return data;
  },
};