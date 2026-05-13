"use client";

import { setPublicity } from "@/server/blog/mutations";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicityToggle({ id, isPublic }: { id: string; isPublic: boolean }) {
  return (
    <Badge
      onClick={() => setPublicity(id, !isPublic)}
      className={cn(
        "cursor-pointer px-3 py-1 h-auto text-xs font-medium transition-colors",
        isPublic
          ? "bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200"
          : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200"
      )}
    >
      {isPublic ? <><Check size={11} />Publikovaný</> : <><Pencil size={11} />Koncept</>}
    </Badge>
  );
}
