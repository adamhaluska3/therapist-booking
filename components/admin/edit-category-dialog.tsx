"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  editCategorySchema,
  EditCategoryType,
} from "@/server/post-category/schema";
import { useMutation } from "@tanstack/react-query";
import { PostCategory } from "@/db/schema";
import { EditCategoryAction } from "@/server/post-category/actions";

export const EditCategoryDialog = ({
  category,
  onEdit,
  children,
}: {
  category: PostCategory;
  onEdit?: (category: PostCategory) => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<EditCategoryType>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: category.name,
      id: category.id,
    },
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: EditCategoryType) => {
      const res = await EditCategoryAction(data);
      if (!res.result) {
        throw new Error(res.error);
      }

      setOpen(false);
      form.reset();
      router.refresh();
      if (onEdit) {
        onEdit(res.category);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={false}
        render={children as React.ReactElement}
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Upraviť kategóriu</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Názov</FormLabel>
                  <FormControl>
                    <Input placeholder="Zadajte názov kategórie" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {isError && <span className="text-red-700">{error.message}</span>}
            <DialogFooter className="flex gap-2">
              <DialogClose
                render={<Button variant="outline" />}
                disabled={isPending}
              >
                Zrušiť
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Ukladám..." : "Uložiť"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
