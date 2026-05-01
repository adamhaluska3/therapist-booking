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
    <div className='my-20 mx-10 md:mx-20'>
        <Link href="/admin/blog" className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600 flex items-center">
            <ArrowLeft/>
            <p>Naspäť na správu blogu</p>
        </Link>
        <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
            Pridať nový článok
        </h1>
        <PostEditor {...props} />
    </div>
  )
}

export default Page;