import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Názov nesmie byť prázdny")
    .max(255, "Názov nesmie byť dlhší než 255 znakov"),
  description: z.string().max(255, "Popis nesmie byť dlhší než 255 znakov"),
  content: z.string().min(1, "Obsah nesmie byť prázdny"),
  categoryId: z.string().nullable(),
  isPublic: z.boolean(),
  titleImage: z.instanceof(File).nullable().optional(),
});

export const updatePostSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  categoryId: z.string().nullable(),
  isPublic: z.boolean(),
  titleImage: z.instanceof(File).nullable().optional(),
  existingTitleImage: z.string().nullable().optional(),
  removeTitleImage: z.boolean().optional(),
});

export const deletePostSchema = z.object({
  id: z.string(),
});

export const setPublicitySchema = z.object({
  id: z.string(),
  isPublic: z.boolean(),
});

export type CreatePostType = z.infer<typeof createPostSchema>;
export type UpdatePostType = z.infer<typeof updatePostSchema>;
export type DeletePostType = z.infer<typeof deletePostSchema>;
export type SetPublicityType = z.infer<typeof setPublicitySchema>;
