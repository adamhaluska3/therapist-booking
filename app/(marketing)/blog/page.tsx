import { BlogFilterProvider } from "@/components/marketing/blog-filter-context";
import { BlogHeaderSection } from "@/components/marketing/blog-header-section";
import { BlogPostsSection } from "@/components/marketing/blog-posts-section";

export default function BlogPage() {
  return (
    <BlogFilterProvider>
      <BlogHeaderSection />
      <BlogPostsSection />
    </BlogFilterProvider>
  );
}
