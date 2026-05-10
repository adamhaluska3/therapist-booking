import { BlogHeaderSection } from "@/components/marketing/blog-header-section";
import { BlogPostsSection } from "@/components/marketing/blog-posts-section";
import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";

const PAGE_SIZE = 6;

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

const BlogPage = async ({ searchParams }: Props) => {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const whereCondition = and(
    eq(posts.isPublic, true),
    category ? eq(posts.categoryId, category) : undefined,
  );

  const [totalResult, postsList, categories] = await Promise.all([
    db.select({ count: count() }).from(posts).where(whereCondition),
    db.query.posts.findMany({
      columns: { id: true, slug: true, title: true, description: true, titleImage: true, createdAt: true },
      with: { category: { columns: { id: true, name: true } } },
      where: (fields, { eq: eqF, and: andF }) => {
        const conditions = [eqF(fields.isPublic, true)];
        if (category) conditions.push(eqF(fields.categoryId, category));
        return andF(...conditions);
      },
      orderBy: (fields, { desc }) => desc(fields.createdAt),
      limit: PAGE_SIZE,
      offset,
    }),
    db.query.postCategories.findMany(),
  ]);

  const totalPages = Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE);

  return (
    <>
      <BlogHeaderSection categories={categories} activeCategory={category ?? null} />
      <BlogPostsSection posts={postsList} page={page} totalPages={totalPages} activeCategory={category ?? null} />
    </>
  );
};

export default BlogPage;
