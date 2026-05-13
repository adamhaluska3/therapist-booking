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
        <article className='mx-auto max-w-5xl'>
            <section className='w-full flex mb-6 items-center flex-wrap gap-4'>
                <div className="flex-1">
                    <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
                        Administratíva
                    </p>
                    <h1 className="font-serif text-4xl font-bold text-neutral-800 mb-2">
                        Správa blogu
                    </h1>
                </div>
                <div className="flex gap-3 flex-col sm:flex-row">
                    <Link href="/admin/blog/new">
                        <Button className="flex items-center rounded-2xl p-2 h-auto text-xs font-semibold uppercase tracking-widest text-white bg-brand-600 hover:bg-brand-700">
                            <Plus/>
                            <span>Nový článok</span>
                        </Button>
                    </Link>
                    <AddCategoryDialog nativeButton={true}>
                        <Button className="flex items-center rounded-2xl p-2 h-auto text-xs border border-gray-200 font-semibold uppercase tracking-widest text-brand-600 bg-white">
                            <Plus/>
                            <span>Nová kategória</span>
                        </Button>
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