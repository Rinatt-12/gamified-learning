import apiClient from '../lib/axios';

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  inviteCode: string;
  email?: string;
  phone?: string;
  password: string;
  name: string;
  group?: string;
  specialty?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    avatarUrl: string | null;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/login', input);
    return data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/register', input);
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get('/api/users/me');
    return data;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout');
  },
};