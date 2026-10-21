import { z } from 'zod';

export const createInviteSchema = z.object({
  count: z.number().int().min(1).max(50).default(1),
  expiresInDays: z.number().int().min(1).max(365).default(30),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;