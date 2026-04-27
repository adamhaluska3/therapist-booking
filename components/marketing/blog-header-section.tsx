"use client";

import { cn } from "@/lib/utils";
import {
  blogCategories,
  blogHeader,
} from "../../app/(marketing)/_content/blog";
import { useBlogFilter } from "./blog-filter-context";

export function BlogHeaderSection() {
  const { active, setActive } = useBlogFilter();

  return (
    <section className="bg-linear-to-b from-white to-surface-100">
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
          {blogCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                active === cat.value
                  ? "bg-brand-700 text-white"
                  : "bg-surface-200 text-neutral-600 hover:bg-surface-300",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
