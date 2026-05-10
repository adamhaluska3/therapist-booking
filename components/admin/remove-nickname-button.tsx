"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { updateUserNickname } from "@/server/user/mutations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function RemoveNicknameButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleRemove() {
    startTransition(async () => {
      try {
        await updateUserNickname(userId, "");
        setOpen(false);
        router.refresh();
        toast.success("Prezývka odstránená");
      } catch (e) {
        console.error(e);
        toast.error("Nepodarilo sa odstrániť prezývku");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-auto p-0 text-red-500 hover:text-red-700 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Odstrániť prezývku?</DialogTitle>
            <DialogDescription>
              Prezývka klienta bude odstránená a namiesto nej sa bude zobrazovať
              originálne meno.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isPending}
            >
              Zrušiť
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending ? "Odstraňujem..." : "Odstrániť"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
