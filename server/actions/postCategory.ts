"use server"

import { postCategories } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { addCategorySchema, type AddCategoryFormData } from "@/lib/schemas/post-category";
import { revalidatePath } from "next/cache";
import type { PostCategory } from "@/db/schema";

export type { AddCategoryFormData };

export type AddCategoryResponse = {
    result: true
    category: PostCategory
} | {
    result: false,
    error: string
}
export const addCategory = async (anyData: any): Promise<AddCategoryResponse> => {
    const data = addCategorySchema.safeParse(anyData);
    if (data.error) {
        return {result: false, error: data.error.message}
    }
    const exists = await db.query.postCategories.findFirst({where: eq(postCategories.name, data.data.name)})

    if (exists) {
        return {result: false, error: "Rovnaké meno už bolo použité"}
    }

    const [category] = await db.insert(postCategories).values({
            name: data.data.name
        }).returning();
    
    return {result: true, category}
}