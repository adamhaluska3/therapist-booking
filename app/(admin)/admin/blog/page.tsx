import { PostsTable } from "@/components/admin/posts-table";
import { db } from "@/lib/db";
import { PostsFilter } from "./posts-filter";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Správa blogu",
};

type Props = {
  searchParams: Promise<{ isPublic?: string, category?: string, query?: string }>;
}

const Page = async ({ searchParams }: Props) => {
    const {isPublic, category, query } = await searchParams;
    const categories = await db.query.postCategories.findMany()
    const postsList = await db.query.posts.findMany({
        where(fields, { eq, and, like }) {
            const conditions = []

            if (isPublic === 'true') conditions.push(eq(fields.isPublic, true))
            if (isPublic === 'false') conditions.push(eq(fields.isPublic, false))
            if (category) conditions.push(eq(fields.categoryId, category))
            if (query) conditions.push(like(fields.title, `%${query}%`))

            return and(...conditions)
        },
        with: { category: true }
        }
    )

    return (
        <div className='mx-10 my-20 md:mx-20'>
            
            
            <div className='flex mb-4 items-center'>
                <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl flex-1">
                    Správa blogu
                </h1>
                <Link href="/admin/blog/new" className="flex items-center rounded-2xl p-4 text-xs font-semibold uppercase tracking-widest text-white bg-brand-600">
                    <Plus/>
                    <span>Nový článok</span>
                </Link>
            </div>
            <div className="my-5">
                <PostsFilter query={query} isPublic={isPublic}/>
            </div>
            <PostsTable data={postsList} />
        </div>
    )
}

export default Page;