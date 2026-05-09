import { PostsTable } from "@/components/admin/posts-table";
import { db } from "@/lib/db";
import { PostsFilter } from "./posts-filter";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AddCategoryDialog } from "@/components/admin/add-category";
import { Button } from "@/components/ui/button";

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
        <div className='mx-auto max-w-5xl'>
            <div className='w-full flex mb-8 items-center flex-wrap'>
                <div className="flex-1">
                    <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
                        Administratíva
                    </p>
                    <h1
                    className="font-serif text-4xl font-bold text-neutral-800 mb-2"
                    >
                        Správa blogu
                    </h1>
                </div>
                <div className="flex gap-5 flex-col sm:flex-row">
                    <Link href="/admin/blog/new" className="flex gap-2 items-center rounded-2xl p-2 text-xs font-semibold uppercase tracking-widest text-white bg-brand-600">
                        <Plus className="size-4"/>
                        <span>Nový článok</span>
                    </Link>
                    <AddCategoryDialog nativeButton={true}>
                        <Button className="flex items-center rounded-2xl p-2 h-auto text-xs border border-gray-200 font-semibold uppercase tracking-widest text-brand-600 bg-white">
                            <Plus/>
                            <span>Nová kategória</span>
                        </Button>
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