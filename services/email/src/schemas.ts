import { z } from 'zod';

export const EmailCreateSchema = z.object({
  recipient: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  source: z.string(),
  sender: z.string().email().optional(),  
});