import { z } from "zod";

export const addCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Názov kategórie nesmie byť prázdny")
    .max(50, "Názov kategórie nesmie byť dlhší ako 50 znakov"),
});

export const editCategorySchema = addCategorySchema.extend({
  id: z.string(),
});

export const removeCategorySchema = z.object({
  id: z.string(),
  newCategoryId: z.string().nullable(),
});

export type AddCategoryFormData = z.infer<typeof addCategorySchema>;

export type EditCategoryFormData = z.infer<typeof editCategorySchema>;

export type RemoveCategoryFormData = z.infer<typeof removeCategorySchema>;
