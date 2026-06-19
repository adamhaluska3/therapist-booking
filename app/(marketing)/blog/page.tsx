import { BlogHeaderSection } from "@/components/marketing/blog-header-section";
import { BlogPostsSection } from "@/components/marketing/blog-posts-section";
import { Metadata } from "next";
import { getPostCategories } from "@/server/post-category/queries";
import { getPosts, getPostsCount } from "@/server/blog/queries";

export const metadata: Metadata = {
  title: "Blog",
};

const PAGE_SIZE = 6;

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

const BlogPage = async ({ searchParams }: Props) => {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [totalResult, postsList, categories] = await Promise.all([
    getPostsCount(category),
    getPosts(category, PAGE_SIZE, offset),
    getPostCategories(),
  ]);

  const totalPages = Math.ceil((totalResult[0]?.count ?? 0) / PAGE_SIZE);

  return (
    <>
      <BlogHeaderSection
        categories={categories}
        activeCategory={category ?? null}
      />
      <BlogPostsSection
        posts={postsList}
        page={page}
        totalPages={totalPages}
        activeCategory={category ?? null}
      />
    </>
  );
};

export default BlogPage;
