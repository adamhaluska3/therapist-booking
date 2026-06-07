import { z } from "zod";

export const UserNoteSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  date: z.date(),
  note: z.string(),
});

export const UserNoteIdSchema = z.object({
  id: z.string(),
});

export type UserNoteType = z.infer<typeof UserNoteSchema>;
export type UserNoteIdType = z.infer<typeof UserNoteIdSchema>;
