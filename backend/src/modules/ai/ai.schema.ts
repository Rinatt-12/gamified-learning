import { z } from 'zod';

export const generateTestSchema = z.object({
  topic: z.string().min(2),
  level: z.string().min(2),
  count: z.number().int().min(1).max(20).default(5),
});

export type GenerateTestInput = z.infer<typeof generateTestSchema>;