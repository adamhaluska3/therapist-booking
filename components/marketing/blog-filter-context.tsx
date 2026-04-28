"use client";

import { createContext, useContext, useState } from "react";
import type { BlogCategory } from "../../app/(marketing)/_content/blog";

type ActiveCategory = BlogCategory | "vsetko";

type BlogFilterContextValue = {
  active: ActiveCategory;
  setActive: (cat: ActiveCategory) => void;
};

const BlogFilterContext = createContext<BlogFilterContextValue | null>(null);

export function BlogFilterProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActiveCategory>("vsetko");
  return (
    <BlogFilterContext.Provider value={{ active, setActive }}>
      {children}
    </BlogFilterContext.Provider>
  );
}

export function useBlogFilter() {
  const ctx = useContext(BlogFilterContext);
  if (!ctx) throw new Error("useBlogFilter must be used inside BlogFilterProvider");
  return ctx;
}
