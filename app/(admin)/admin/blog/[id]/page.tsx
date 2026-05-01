import { PostEditor, PostEditorProps } from '@/components/admin/post-editor';
import { postCategories, posts } from '@/db/schema';
import { db } from '@/lib/db'
import { cn } from '@/lib/utils';
import { eq } from 'drizzle-orm';
import { ArrowLeft, MoveLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Správa blogu – Úprava príspevku",
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  })

  if (!post) {
    notFound()
  }

  const categories = await db.query.postCategories.findMany()

  const props: PostEditorProps = {
      post: post,
      categories: categories
  }

  return (
    <div className='my-20 mx-10 md:mx-20'>
        <Link href="/admin/blog" className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600 flex items-center">
            <ArrowLeft/>
            <p>Naspäť na správu blogu</p>
        </Link>
        <div className='flex mb-4 items-center'>
            <h1 className="mb-2 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl flex-1">
                Upraviť článok
            </h1>
            <span className={cn("rounded-2xl p-2 text-xs font-semibold uppercase tracking-widest text-white", post.isPublic ?"bg-brand-400" : "bg-gray-400")}>
                {post.isPublic ? "Publikovaný" : "Koncept"}
            </span>
        </div>
        <PostEditor {...props} />
    </div>
  )
}

export default Page;