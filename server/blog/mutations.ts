"use server";

import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth";
import { generateSlug } from "./utils";
import {
  CreatePostType,
  DeletePostType,
  SetPublicityType,
  UpdatePostType,
} from "./schema";

export async function createPost(
  data: CreatePostType,
): Promise<{ success: false; error: string } | { success: true }> {
  const slug = generateSlug(data.title, data.isPublic);
  const existing = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });
  if (existing) {
    return {
      success: false,
      error: "Príspevok s podobným názvom už je zverejnený.",
    };
  }

  let titleImage: string | null = null;

  if (data.titleImage && data.titleImage.size > 0) {
    const blob = await put(data.titleImage.name, data.titleImage, {
      access: "public",
      addRandomSuffix: true,
    });
    titleImage = blob.url;
  }

  await db.insert(posts).values({
    title: data.title,
    description: data.description,
    content: data.content,
    categoryId: data.categoryId,
    isPublic: data.isPublic,
    titleImage,
    slug: slug,
  });

  return { success: true };
}

export async function updatePost(
  post: UpdatePostType,
): Promise<{ success: false; error: string } | { success: true }> {
  await requireAdmin();

  const slug = generateSlug(post.title, post.isPublic);
  const conflict = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });
  if (conflict && conflict.id !== post.id) {
    return {
      success: false,
      error: "Príspevok s podobným názvom už je zverejnený.",
    };
  }

  let titleImage = post.existingTitleImage ?? null;

  if (post.removeTitleImage && post.existingTitleImage) {
    await del(post.existingTitleImage).catch(() => {
      console.log(
        "Error deleting existing title image:",
        post.existingTitleImage,
      );
    });
    titleImage = null;
  }

  if (post.titleImage && post.titleImage.size > 0) {
    if (post.existingTitleImage) {
      await del(post.existingTitleImage).catch(() => {
        console.log(
          "Error deleting existing title image:",
          post.existingTitleImage,
        );
      });
    }

    const blob = await put(post.titleImage.name, post.titleImage, {
      access: "public",
      addRandomSuffix: true,
    });
    titleImage = blob.url;
  }

  await db
    .update(posts)
    .set({
      title: post.title,
      description: post.description,
      content: post.content,
      categoryId: post.categoryId,
      isPublic: post.isPublic,
      slug: slug,
      titleImage,
    })
    .where(eq(posts.id, post.id));

  return { success: true };
}

export const deletePost = async ({ id }: DeletePostType) => {
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
};

export const setPostPublicity = async ({
  id,
  isPublic,
}: SetPublicityType): Promise<
  { success: false; error: string } | { success: true }
> => {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post) return { success: false, error: "Príspevok nebol nájdený" };
  const slug = generateSlug(post.title, isPublic);
  const conflict = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });
  if (conflict && conflict.id !== id) {
    return {
      success: false,
      error: "Príspevok s podobným názvom už je zverejnený.",
    };
  }
  await db.update(posts).set({ isPublic, slug }).where(eq(posts.id, id));
  return { success: true };
};
