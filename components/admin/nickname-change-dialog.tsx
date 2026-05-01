"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserNickname } from "@/server/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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

const nicknameSchema = z.object({
  nickname: z.string().max(100, "Prezývka nesmie byť dlhšia ako 100 znakov"),
});

type NicknameFormData = z.infer<typeof nicknameSchema>;

export function NicknameChangeDialog({
  userId,
  currentNickname,
}: {
  userId: string;
  currentNickname?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: currentNickname ?? "",
    },
  });

  async function onSubmit(data: NicknameFormData) {
    startTransition(async () => {
      await updateUserNickname(userId, data.nickname);
      setOpen(false);
      form.reset();
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-auto p-0 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Zmeniť prezývku</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezývka</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Zadajte prezývku klienta"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex gap-2">
                <DialogClose>
                  <Button variant="outline">Zrušiť</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Ukladám..." : "Uložiť"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
