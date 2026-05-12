"use client";

import { cn } from "@/lib/utils";
import {
  blogHeader,
} from "../../app/(marketing)/_content/blog";
import { useRouter, useSearchParams } from "next/navigation";
import { PostCategory } from "@/db/schema";

export type BlogHeaderSectionProp = {
  categories: PostCategory[];
  activeCategory: string | null;
};

export function BlogHeaderSection({ categories, activeCategory }: BlogHeaderSectionProp) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggle = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("category") === catId) {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-600">
          {blogHeader.label}
        </p>
        <h1 className="mb-4 font-serif text-3xl font-semibold leading-tight text-brand-900 md:text-5xl">
          {blogHeader.heading}
        </h1>
        <p className="mb-8 max-w-lg text-sm leading-relaxed text-neutral-500 md:mb-10">
          {blogHeader.subheading}
        </p>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-brand-700 text-white"
                  : "bg-surface-200 text-neutral-600 hover:bg-surface-300",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
