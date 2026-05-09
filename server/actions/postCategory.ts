"use server"

import { postCategories, posts } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, ne } from "drizzle-orm";
import { addCategorySchema, type AddCategoryFormData } from "@/lib/schemas/post-category";
import type { PostCategory } from "@/db/schema";
import { revalidatePath } from "next/cache";

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
    
    revalidatePath("/admin/post-categories");
    return {result: true, category}
}

export type EditCategoryResponse = {
    result: true
    category: PostCategory
} | {
    result: false,
    error: string
}

export const editCategory = async (id: string, anyData: any): Promise<EditCategoryResponse> => {
    const data = addCategorySchema.safeParse(anyData);
    if (data.error) {
        return {result: false, error: data.error.message}
    }
    const exists = await db.query.postCategories.findFirst({where: and(eq(postCategories.name, data.data.name), ne(postCategories.id, id))})

    if (exists) {
        return {result: false, error: "Rovnaké meno už bolo použité"}
    }

    const [category] = await db.update(postCategories).set({
            name: data.data.name
        }).where(eq(postCategories.id, id)).returning();

    
    revalidatePath("/admin/post-categories");
    return {result: true, category}
}

export type RemoveCategoryResponse = {
    result: true
} | {
    result: false,
    error: string
}

export const removeCategory = async (id: string, newCategory: PostCategory | null): Promise<RemoveCategoryResponse> => {
    if (id === newCategory?.id) {
        return {result: false, error: "Vyberte inú kategóriu"}
    }

    if (newCategory !== null) {
        const verifyNewCategory = await db.query.postCategories.findFirst({where: eq(postCategories.id, newCategory.id)})
        if (!verifyNewCategory) {
            return {result: false, error: "Vybraná kategória neexistuje"}
        }
    }
    await db.transaction(async (tx) => {
        await tx.update(posts).set({
                categoryId: newCategory?.id ?? null
            }).where(eq(posts.categoryId, id))
        
        await tx.delete(postCategories).where(eq(postCategories.id, id))
    })
    
    revalidatePath("/admin/post-categories");
    return {result: true}
}