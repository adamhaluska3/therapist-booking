"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { deletePostAction } from "@/server/blog/actions";

export const RemovePostDialog = ({
  id,
  title,
}: {
  id: string;
  title?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={12} />
        Vymazať
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Vymazať príspevok</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <p>
              Pokúšate sa vymazať príspevok: {title}
              <br />
              Ste si istý, že chcete pokračovať? Táto akcia je trvalá.
            </p>
            <br />
            <p>
              Keď chcete príspevok iba skryť pre klientov, označte ho ako{" "}
              <b>Koncpet</b>
            </p>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Zrušiť
            </DialogClose>
            <Button
              className="bg-red-700"
              onClick={() => {
                deletePostAction({ id });
                setOpen(false);
              }}
            >
              Vymazať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
