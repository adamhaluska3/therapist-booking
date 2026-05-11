import { AddCategoryDialog } from "@/components/admin/add-category";
import { PostCategoriesTable } from "@/components/admin/post-categories-table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Správa kategórií príspevkov",
};

export default async function Page() {
  const categories = await db.query.postCategories.findMany();

  return (
    <article className="mx-auto max-w-5xl">
      <section className="w-full flex mb-8 items-center flex-wrap">
        <div className="flex-1">
          <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
            Administratíva
          </p>
          <h1 className="font-serif text-4xl font-bold text-neutral-800 mb-2">
            Správa kategórií príspevkov
          </h1>
        </div>
        <div className="flex gap-5">
          <AddCategoryDialog nativeButton={true}>
            <Button className="flex items-center rounded-2xl p-2 h-auto text-xs border border-gray-200 font-semibold uppercase tracking-widest text-brand-600 bg-white">
              <Plus />
              <span>Nová kategória</span>
            </Button>
          </AddCategoryDialog>
        </div>
      </section>
      <section className="w-full">
        <PostCategoriesTable categories={categories} />
      </section>
    </article>
  );
}
