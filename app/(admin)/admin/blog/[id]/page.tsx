import { PostEditor, PostEditorProps } from "@/components/admin/post-editor";
import { PublicityToggle } from "@/components/admin/publicity-toggle";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Úprava príspevku",
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  if (!post) {
    notFound();
  }

  const categories = await db.query.postCategories.findMany();

  const props: PostEditorProps = {
    post: {
      ...post,
      titleImage: post.titleImage ?? undefined,
      categoryId: post.categoryId ?? undefined,
    },
    categories: categories,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/blog"
        className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600 flex items-center"
      >
        <ArrowLeft />
        <p>Naspäť na správu blogu</p>
      </Link>
      <div className="flex mb-4 items-center">
        <h1 className="font-serif text-4xl font-bold text-neutral-800 mb-2 flex-1">
          Upraviť článok
        </h1>
        <PublicityToggle id={post.id} isPublic={post.isPublic} />
      </div>
      <PostEditor {...props} />
    </div>
  );
};

export default Page;
