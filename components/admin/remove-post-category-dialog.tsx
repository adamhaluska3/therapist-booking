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
import { PostCategory } from "@/db/schema";
import { CategoryCombobox } from "./category-combobox";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { removeCategory } from "@/server/postCategory/mutations";

export const RemovePostCategoryDialog = ({
  id,
  name,
  categories,
}: {
  id: string;
  name: string;
  categories: PostCategory[];
}) => {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<PostCategory | null>(null);

  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await removeCategory(id, newCategory);
      if (!res.result) {
        throw new Error(res.error);
      }

      setOpen(false);
      router.refresh();
    },
  });

  return (
    <>
      <Trash2
        className="text-red-900 hover:cursor-pointer"
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Vymazať príspevok</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <p>
              Pokúšate sa vymazať kategóriu: {name}
              <br />
              Ste si istý, že chcete pokračovať? Táto akcia je trvalá.
            </p>
            <br />
            <div className="flex flex-col">
              <label>Nahradiť za kategóriu:</label>
              <CategoryCombobox
                category={newCategory}
                categories={categories.filter((c) => c.id !== id)}
                onChange={(c) => setNewCategory(c)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Zrušiť
            </DialogClose>
            <Button
              className="bg-red-700"
              onClick={() => {
                mutate();
                setOpen(false);
              }}
            >
              {isPending ? "Vymazuje sa..." : "Vymazať"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
