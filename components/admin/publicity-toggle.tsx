"use client";

import { setPublicity } from "@/server/blog/mutations";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PublicityToggle({
  id,
  isPublic,
}: {
  id: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: () => setPublicity(id, !isPublic),
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
    <span
      onClick={() => !isPending && mutate()}
      className={cn(
        "rounded-2xl hover:cursor-pointer p-2 text-xs font-semibold uppercase tracking-widest text-white",
        isPublic ? "bg-brand-400" : "bg-gray-400",
        isPending && "opacity-50 cursor-wait",
      )}
    >
      {isPublic ? "Publikovaný" : "Koncept"}
    </span>
  );
}
