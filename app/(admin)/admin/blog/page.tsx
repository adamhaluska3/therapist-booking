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
        <div className='mx-auto max-w-6xl px-8 py-10'>
            <div className='w-full flex mb-4 items-center flex-wrap'>
                <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl flex-1 min-w-50">
                    Správa blogu
                </h1>
                <div className="flex gap-5">
                    <Link href="/admin/blog/new" className="flex items-center rounded-2xl p-4 text-xs font-semibold uppercase tracking-widest text-white bg-brand-600">
                        <Plus/>
                        <span>Nový článok</span>
                    </Link>
                    <AddCategoryDialog>
                        <div className="flex items-center rounded-2xl p-2 text-xs font-semibold uppercase tracking-widest text-white bg-gray-400">
                            <Plus/>
                            <span>Nová kategória</span>
                        </div>
                    </AddCategoryDialog>
                </div>
            </div>
            <div className="my-5">
                <PostsFilter query={query} isPublic={isPublic}/>
            </div>
            <PostsTable data={postsList} />
        </div>
    )
}

export default Page;