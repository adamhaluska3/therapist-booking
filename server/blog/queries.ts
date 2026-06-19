"use server";

import { db } from "@/lib/db";
import { and, count, eq } from "drizzle-orm";
import { posts } from "@/db/schema";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export async function getPostBySlug(slug: string) {
  const post = await db.query.posts.findFirst({
    where: (fields, { eq }) =>
      and(eq(fields.slug, slug), eq(fields.isPublic, true)),
    with: { category: true },
  });
  return post;
}

export async function getPostById(id: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
  return post;
}

export async function getPosts(
  category: string | undefined,
  pageSize: number,
  offset: number,
) {
  return db.query.posts.findMany({
    columns: {
      id: true,
      slug: true,
      title: true,
      description: true,
      titleImage: true,
      createdAt: true,
    },
    with: { category: { columns: { id: true, name: true } } },
    where: (fields, { eq: eqF, and: andF }) => {
      const conditions = [eqF(fields.isPublic, true)];
      if (category) conditions.push(eqF(fields.categoryId, category));
      return andF(...conditions);
    },
    orderBy: (fields, { desc }) => desc(fields.createdAt),
    limit: pageSize,
    offset,
  });
}

export async function getPostsCount(categoryId: string | undefined) {
  const whereCondition = and(
    eq(posts.isPublic, true),
    categoryId ? eq(posts.categoryId, categoryId) : undefined,
  );
  return db.select({ count: count() }).from(posts).where(whereCondition);
}

export async function getAdminPosts({
  isPublic,
  category,
  query,
}: {
  isPublic?: string;
  category?: string;
  query?: string;
}) {
  let postsList = await db.query.posts.findMany({
    where(fields, { eq: eqF, and: andF }) {
      const conditions = [];

      if (isPublic === "true") conditions.push(eqF(fields.isPublic, true));
      if (isPublic === "false") conditions.push(eqF(fields.isPublic, false));
      if (category) conditions.push(eqF(fields.categoryId, category));

      return andF(...conditions);
    },
    with: { category: true },
  });

  if (query) {
    const normalizedQuery = normalize(query);
    postsList = postsList.filter((post) =>
      normalize(post.title).includes(normalizedQuery),
    );
  }

  return postsList;
}
