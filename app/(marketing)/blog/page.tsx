import { BlogFilterProvider } from "@/components/marketing/blog-filter-context";
import { BlogHeaderSection } from "@/components/marketing/blog-header-section";
import { BlogPostsSection } from "@/components/marketing/blog-posts-section";
import { db } from "@/lib/db";

const BlogPage = async () => {

  const categories = await db.query.postCategories.findMany()
  const posts = await db.query.posts.findMany({
    columns: {
      id: true,
      slug: true,
      title: true,
      description: true,
      titleImage: true,
      createdAt: true
    },
    with: {
      category: {
        columns: {
          id: true,
          name: true,
        }
      }
    },
    where: (fields, { eq }) => eq(fields.isPublic, true)
  })

  return (
    <BlogFilterProvider>
      <BlogHeaderSection categories={categories}/>
      <BlogPostsSection posts={posts}/>
    </BlogFilterProvider>
  );
}

export default BlogPage;
