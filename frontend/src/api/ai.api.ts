import apiClient from '../lib/axios';

export const aiApi = {
  generateTest: async (input: { topic: string; level: string; count: number }) => {
    const { data } = await apiClient.post('/api/ai/generate-test', input);
    return data;
  },

  weakTopics: async () => {
    const { data } = await apiClient.get('/api/ai/weak-topics');
    return data;
  },
};