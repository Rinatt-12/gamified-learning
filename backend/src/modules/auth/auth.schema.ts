import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Email немесе телефон кемінде 3 таңба'),
  password: z.string().min(6, 'Пароль кемінде 6 таңба'),
});

export const registerSchema = z.object({
  inviteCode: z.string().min(1, 'Invite код қажет'),
  email: z.string().email('Email дұрыс емес').optional(),
  phone: z.string().min(10, 'Телефон дұрыс емес').optional(),
  password: z.string().min(6, 'Пароль кемінде 6 таңба'),
  name: z.string().min(2, 'Аты кемінде 2 таңба'),
  group: z.string().optional(),
  specialty: z.string().optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh токен қажет'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;