import { z } from "zod";

export const UserNoteSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  date: z.date(),
  note: z.string(),
});

export type UserNotePayload = z.infer<typeof UserNoteSchema>;
