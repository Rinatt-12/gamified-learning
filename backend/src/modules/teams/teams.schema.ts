import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(3, 'Команда аты кемінде 3 таңба').max(50),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;