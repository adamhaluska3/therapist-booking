import { AddCategoryDialog } from "@/components/admin/add-category";
import { PostCategoriesTable } from "@/components/admin/post-categories-table";
import { Plus } from "lucide-react";
import { getPostCategories } from "@/server/post-category/queries";

export const metadata = {
  title: "Správa kategórií príspevkov",
};

export default async function PostCategoriesPage() {
  const categories = await getPostCategories();

  return (
    <article className="mx-auto max-w-5xl">
      <section className="w-full flex mb-8 items-center flex-wrap gap-4">
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
  );
}
