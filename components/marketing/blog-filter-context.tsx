"use client";

import { createContext, useContext, useState } from "react";
import type { BlogCategory } from "../../app/(marketing)/_content/blog";

type ActiveCategory = string | null;

type BlogFilterContextValue = {
  active: ActiveCategory;
  setActive: (cat: ActiveCategory) => void;
};

const BlogFilterContext = createContext<BlogFilterContextValue | null>(null);

<<<<<<< HEAD
export function BlogFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<ActiveCategory>("vsetko");
=======
export function BlogFilterProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActiveCategory>(null);
>>>>>>> 923fda3 (feat: marketing connection)
  return (
    <BlogFilterContext.Provider value={{ active, setActive }}>
      {children}
    </BlogFilterContext.Provider>
  );
}

export function useBlogFilter() {
  const ctx = useContext(BlogFilterContext);
  if (!ctx)
    throw new Error("useBlogFilter must be used inside BlogFilterProvider");
  return ctx;
}
