import { AddCategoryDialog } from "@/components/admin/add-category";
import { PostCategoriesTable } from "@/components/admin/post-categories-table";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

const Page = async () => {
    const categories = await db.query.postCategories.findMany();

    return (
         <article className='mx-auto max-w-5xl'>
            <section className='w-full flex mb-8 items-center flex-wrap gap-4'>
                <div className="flex-1">
                    <h1 className="font-serif text-3xl font-semibold text-neutral-800 mb-2">
                        Správa kategórií príspevkov
                    </h1>
                </div>
                <div className="flex gap-3">
                    <AddCategoryDialog nativeButton={true}>
                        <button className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
                            <Plus size={16} />
                            <span>Nová kategória</span>
                        </button>
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