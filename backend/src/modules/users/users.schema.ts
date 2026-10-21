import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
  group: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().min(10).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;