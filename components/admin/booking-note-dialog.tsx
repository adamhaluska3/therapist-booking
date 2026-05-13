"use client";
import { UNKNOWN_CLIENT } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookingWithUser } from "@/server/booking/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  booking: BookingWithUser;
}

export function BookingNoteDialog({ open, onClose, booking }: Props) {
  const clientName =
    booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Poznámka k sedeniu</DialogTitle>
          <DialogDescription>Klient: {clientName}</DialogDescription>
        </DialogHeader>
        {booking.note ? (
          <p className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-neutral-700 whitespace-pre-wrap">
            {booking.note}
          </p>
        ) : (
          <p className="text-sm text-neutral-400 italic">Žiadna poznámka.</p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Zavrieť
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
