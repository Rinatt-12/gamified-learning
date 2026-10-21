import { z } from 'zod';

export const submitAttemptSchema = z.object({
  answer: z.string().min(1, 'Жауап қажет'),
  timeSpent: z.number().int().min(0).optional(),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;