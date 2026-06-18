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

export type AddCategoryType = z.infer<typeof addCategorySchema>;

export type EditCategoryType = z.infer<typeof editCategorySchema>;

export type RemoveCategoryType = z.infer<typeof removeCategorySchema>;
