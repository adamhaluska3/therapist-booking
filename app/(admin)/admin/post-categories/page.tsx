import { AddCategoryDialog } from "@/components/admin/add-category";
import { PostCategoriesTable } from "@/components/admin/post-categories-table";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

const Page = async () => {
    const categories = await db.query.postCategories.findMany();

    return (
         <article className='mx-auto max-w-6xl px-8 py-10'>
            <section className='w-full flex mb-4 items-center flex-wrap'>
                <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl flex-1 min-w-50">
                    Správa kategórií príspevov
                </h1>
                <div className="flex gap-5">
                    <AddCategoryDialog>
                        <div className="flex items-center rounded-2xl p-2 text-xs font-semibold uppercase tracking-widest text-white bg-gray-400">
                            <Plus/>
                            <span>Nová kategória</span>
                        </div>
                    </AddCategoryDialog>
                </div>
            </section>
            <section className="w-full">
                <PostCategoriesTable categories={categories} />
            </section>
        </article>
    )
}

export default Page;