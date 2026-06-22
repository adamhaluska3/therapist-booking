"use server";

import { db } from "@/lib/db";

export async function getPostCategories() {
    const categories = await db.query.postCategories.findMany();
    return categories;
}