"use server";

import { postCategories, posts } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, ne } from "drizzle-orm";
import {
  addCategorySchema,
  EditCategoryType,
  RemoveCategoryType,
} from "./schema";
import type { PostCategory } from "@/db/schema";

export type AddCategoryResponse =
  | {
      result: true;
      category: PostCategory;
    }
  | {
      result: false;
      error: string;
    };
export const addCategory = async (
  anyData: any,
): Promise<AddCategoryResponse> => {
  const data = addCategorySchema.safeParse(anyData);
  if (data.error) {
    return { result: false, error: data.error.message };
  }
  const exists = await db.query.postCategories.findFirst({
    where: eq(postCategories.name, data.data.name),
  });

  if (exists) {
    return { result: false, error: "Rovnaké meno už bolo použité" };
  }

  const [category] = await db
    .insert(postCategories)
    .values({
      name: data.data.name,
    })
    .returning();
  return { result: true, category };
};

export type EditCategoryResponse =
  | {
      result: true;
      category: PostCategory;
    }
  | {
      result: false;
      error: string;
    };

export const editCategory = async ({
  id,
  name,
}: EditCategoryType): Promise<EditCategoryResponse> => {
  const exists = await db.query.postCategories.findFirst({
    where: and(eq(postCategories.name, name), ne(postCategories.id, id)),
  });

  if (exists) {
    return { result: false, error: "Rovnaké meno už bolo použité" };
  }

  const [category] = await db
    .update(postCategories)
    .set({
      name: name,
    })
    .where(eq(postCategories.id, id))
    .returning();

  return { result: true, category };
};

export type RemoveCategoryResponse =
  | {
      result: true;
    }
  | {
      result: false;
      error: string;
    };

export const removeCategory = async ({
  id,
  newCategoryId,
}: RemoveCategoryType): Promise<RemoveCategoryResponse> => {
  if (id === newCategoryId) {
    return { result: false, error: "Vyberte inú kategóriu" };
  }

  if (newCategoryId !== null) {
    const verifyNewCategory = await db.query.postCategories.findFirst({
      where: eq(postCategories.id, newCategoryId),
    });
    if (!verifyNewCategory) {
      return { result: false, error: "Vybraná kategória neexistuje" };
    }
  }
  await db.transaction(async (tx) => {
    await tx
      .update(posts)
      .set({
        categoryId: newCategoryId ?? null,
      })
      .where(eq(posts.categoryId, id));

    await tx.delete(postCategories).where(eq(postCategories.id, id));
  });
  return { result: true };
};
