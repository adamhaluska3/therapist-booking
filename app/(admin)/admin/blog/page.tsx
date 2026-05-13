import { PostsTable } from "@/components/admin/posts-table";
import { db } from "@/lib/db";
import { PostsFilter } from "./posts-filter";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AddCategoryDialog } from "@/components/admin/add-category";

export const metadata = {
  title: "Správa blogu",
};

type Props = {
  searchParams: Promise<{ isPublic?: string, category?: string, query?: string }>;
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const Page = async ({ searchParams }: Props) => {
    const {isPublic, category, query } = await searchParams;
    let postsList = await db.query.posts.findMany({
        where(fields, { eq, and }) {
            const conditions = []

            if (isPublic === 'true') conditions.push(eq(fields.isPublic, true))
            if (isPublic === 'false') conditions.push(eq(fields.isPublic, false))
            if (category) conditions.push(eq(fields.categoryId, category))

            return and(...conditions)
        },
        with: { category: true }
        }
    )

    if (query) {
        const normalizedQuery = normalize(query)
        postsList = postsList.filter(p => normalize(p.title).includes(normalizedQuery))
    }

    return (
        <article className='mx-auto max-w-5xl'>
            <section className='w-full flex mb-8 items-center flex-wrap gap-4'>
                <div className="flex-1">
                    <h1 className="font-serif text-3xl font-semibold text-neutral-800 mb-2">
                        Správa blogu
                    </h1>
                </div>
                <div className="flex gap-3 flex-col sm:flex-row">
                    <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
                        <Plus size={16} />
                        <span>Nový článok</span>
                    </Link>
                    <AddCategoryDialog nativeButton={true}>
                        <button className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-surface-50 transition-colors">
                            <Plus size={16} />
                            <span>Nová kategória</span>
                        </button>
                    </AddCategoryDialog>
                </div>
            </section>
            <section className="w-full mb-6">
                <PostsFilter query={query} isPublic={isPublic}/>
            </section>
            <section className="w-full">
                <PostsTable data={postsList} />
            </section>
        </article>
    )
}

export default Page;