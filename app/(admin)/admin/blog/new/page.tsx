import { PostEditor, PostEditorProps } from '@/components/admin/post-editor';
import { db } from '@/lib/db'
import { ArrowLeft, MoveLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: "Správa blogu – Nový príspevok",
};

const Page = async () => {
  const categories = await db.query.postCategories.findMany();
  const props: PostEditorProps = {
      post: {
          id: null,
          title: '',
          description: '',
          content: '',
      },
      categories: categories
  }

  return (
    <div className='mx-auto max-w-5xl'>
        <Link href="/admin/blog" className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600 flex items-center">
            <ArrowLeft/>
            <p>Naspäť na správu blogu</p>
        </Link>
        <h1
            className="font-serif text-3xl font-semibold text-neutral-800 mb-2"
        >
            Pridať nový článok
        </h1>
        <PostEditor {...props} />
    </div>
  )
}

export default Page;