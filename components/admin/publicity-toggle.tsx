"use client";

import { setPublicity } from "@/server/actions/blog";
import { cn } from "@/lib/utils";

export function PublicityToggle({ id, isPublic }: { id: string; isPublic: boolean }) {
  return (
    <span
      onClick={() => setPublicity(id, !isPublic)}
      className={cn(
        "rounded-2xl hover:cursor-pointer p-2 text-xs font-semibold uppercase tracking-widest text-white",
        isPublic ? "bg-brand-400" : "bg-gray-400"
      )}
    >
      {isPublic ? "Publikovaný" : "Koncept"}
    </span>
  );
}
