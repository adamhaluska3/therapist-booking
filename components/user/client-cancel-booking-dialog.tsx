"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { booking, BookingType } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelClientBookingAction } from "@/server/booking/actions";

export type ClientEditBookingDialogProps = {
  item: InferSelectModel<typeof booking> & { bookingType: BookingType | null };
  children: React.ReactNode;
};

export const ClientCancelBookingDialog = ({
  item,
  children,
}: ClientEditBookingDialogProps) => {
  const [open, setOpen] = useState(false);

  const {
    mutate: confirmCancel,
    isPending,
    error: cancelError,
    isSuccess: cancelDone,
    reset,
  } = useMutation({
    mutationFn: () => cancelClientBookingAction({ bookingId: item.id }),
    onSuccess: (result) => {
      if (!result.ok)
        throw new Error(result.error ?? "Nepodarilo sa zrušiť rezerváciu.");
      toast.success("Rezervácia zrušená");
    },
  });

  return (
    <Dialog open={open} onOpenChange={() => setOpen((s) => !s)}>
      <DialogTrigger nativeButton={false} render={<span>{children}</span>} />
      <DialogContent className="max-w-fit max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Zrušenie rezervácie</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 min-h-0">
          {!cancelDone ? (
            <div className="px-6 pb-2 flex flex-col gap-4 min-w-64">
              <p className="text-sm text-neutral-600">
                Naozaj chcete zrušiť toto sedenie?
              </p>
              {cancelError && (
                <p className="text-sm text-red-600">{cancelError.message}</p>
              )}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={() => confirmCancel()}
                  disabled={isPending}
                >
                  {isPending ? "Rušíme..." : "Áno, zrušiť"}
                </button>
                <button
                  className="flex-1 py-2.5 bg-surface-100 text-neutral-700 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors disabled:opacity-50"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                  disabled={isPending}
                >
                  Späť
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-4 flex flex-col items-center gap-3 min-w-64">
              <p className="font-semibold text-neutral-700">
                Sedenie bolo zrušené.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
