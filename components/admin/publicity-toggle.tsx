"use client";

import { Badge } from "@/components/ui/badge";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setPostPublicityAction } from "@/server/blog/actions";

export function PublicityToggle({
  id,
  isPublic,
}: {
  id: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: () => setPostPublicityAction({ id, isPublic: !isPublic }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(`Príspevok je ${!isPublic ? "verejný" : "neverejný"}`);
        router.refresh();
      }
    },
    onError: () => toast.error("Nepodarilo sa zmeniť stav príspevku."),
  });

  return (
    <Badge
      onClick={() => mutate()}
      className={cn(
        "cursor-pointer px-3 py-1 h-auto text-xs font-medium transition-colors",
        isPending && "pointer-events-none opacity-70",
        isPublic
          ? "bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200"
          : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200",
      )}
    >
      {isPublic ? (
        <>
          <Check size={11} />
          Publikovaný
        </>
      ) : (
        <>
          <Pencil size={11} />
          Koncept
        </>
      )}
    </Badge>
  );
}
