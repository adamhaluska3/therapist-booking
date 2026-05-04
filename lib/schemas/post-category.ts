import z from "zod";

export const addCategorySchema = z.object({
  name: z.string()
    .min(1, "Názov kategórie nesmie byť prázdny")
    .max(50, "Názov kategórie nesmie byť dlhší ako 50 znakov"),
});

export type AddCategoryFormData = z.infer<typeof addCategorySchema>;

export const editCategorySchema = addCategorySchema;

export type EditCategoryFormData = z.infer<typeof editCategorySchema>;
