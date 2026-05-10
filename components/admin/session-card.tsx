"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Check,
  Video,
  Pencil,
  X,
  Clock,
  Hash,
  MessageSquare,
  MapPin,
  Monitor,
  MoreHorizontal,
} from "lucide-react";
import type { Booking, BookingType } from "@/db/schema";
import { formatTime, formatMonthShort } from "@/lib/date-utils";
import { getInitials } from "@/lib/formatting";
import { UNKNOWN_CLIENT } from "@/lib/constants";
import { AdminCard } from "@/components/admin/admin-card";
import { BOOKING_TYPE_COLORS } from "@/components/admin/calendar-event-card";
import { BookingDialog } from "@/components/admin/booking-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { UserOption } from "@/server/user/schema";
import {
  updateBookingFromDialog,
  updateBookingStatus,
} from "@/server/booking/mutations";
import { toast } from "sonner";

type ConfirmAction = "finished" | "cancelled";

const CONFIRM_CONFIG: Record<
  ConfirmAction,
  {
    title: string;
    description: (name: string) => string;
    label: string;
    className: string;
  }
> = {
  finished: {
    title: "Označiť ako absolvované?",
    description: (name) =>
      `Sedenie s klientom ${name} bude označené ako absolvované a zmizne zo zoznamu.`,
    label: "Potvrdiť",
    className: "bg-brand-600 hover:bg-brand-700 text-white",
  },
  cancelled: {
    title: "Zrušiť sedenie?",
    description: (name) =>
      `Sedenie s klientom ${name} bude zrušené a zmizne zo zoznamu.`,
    label: "Zrušiť sedenie",
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
};

export function SessionCard({
  booking,
  bookingTypes,
  users,
}: {
  booking: BookingWithUser;
  bookingTypes: BookingType[];
  users: UserOption[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);

  const clientName =
    booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT;
  const bookingType =
    bookingTypes.find((t) => t.id === booking.bookingTypeId) ?? null;
  const config = confirmDialog ? CONFIRM_CONFIG[confirmDialog] : null;

  function invalidateAndRefresh() {
    void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
    router.refresh();
  }

  function handleConfirm() {
    if (!confirmDialog) return;
    startTransition(async () => {
      await updateBookingStatus(booking.id, confirmDialog);
      setConfirmDialog(null);
      invalidateAndRefresh();
      toast.success(
        `Sedenie ${confirmDialog === "finished" ? "označené ako absolvované" : "zrušené"}.`,
      );
    });
  }

  function handleSave(updated: Booking) {
    startTransition(async () => {
      await updateBookingFromDialog(
        updated.id,
        {
          start: updated.start,
          end: updated.end,
          bookingTypeId: updated.bookingTypeId ?? null,
          userId: updated.userId ?? null,
          note: updated.note ?? null,
          locationType: updated.locationType,
        },
        booking.start,
      );
      setEditOpen(false);
      invalidateAndRefresh();
      toast.success(`Sedenie aktualizované`);
    });
  }

  return (
    <>
      <AdminCard className="gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 shrink-0 text-center border-r border-surface-200 pr-4">
            <p className="text-2xl font-bold text-neutral-800 leading-none">
              {booking.start.getDate()}
            </p>
            <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">
              {formatMonthShort(booking.start)}
            </p>
          </div>

          <div className="flex items-center gap-6 flex-1 min-w-0">
            {booking.userId ? (
              <Link
                href={`/admin/clients/${booking.userId}`}
                className="flex items-center gap-3 min-w-0 group"
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                  {getInitials(clientName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800 text-sm leading-tight truncate group-hover:text-brand-700 transition-colors">
                    {clientName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                    <Clock size={11} className="shrink-0" />
                    <span>
                      {formatTime(booking.start)} – {formatTime(booking.end)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                    <Hash size={11} className="shrink-0" />
                    <span>2400001</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                  {getInitials(clientName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800 text-sm leading-tight truncate">
                    {clientName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                    <Clock size={11} className="shrink-0" />
                    <span>
                      {formatTime(booking.start)} – {formatTime(booking.end)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                    <Hash size={11} className="shrink-0" />
                    <span>2400001</span>
                  </div>
                </div>
              </div>
            )}

            <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
              {bookingType && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        BOOKING_TYPE_COLORS[bookingType.id]?.bg ?? "#427a5c",
                    }}
                  />
                  <span>{bookingType.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin size={13} className="shrink-0" />
                <span>Osobne</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
            <button className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700 transition-colors">
              <Video size={13} />
              <span>Pripojiť sa</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:bg-surface-50 transition-colors">
                <MoreHorizontal size={13} />
                <span>Akcie</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setConfirmDialog("finished")}>
                  <Check size={13} />
                  Absolvované
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MessageSquare size={13} />
                  Poznámka
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil size={13} />
                  Upraviť
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => setConfirmDialog("cancelled")}
                >
                  <X size={13} />
                  Zrušiť
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex sm:hidden items-center gap-4">
          {bookingType && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    BOOKING_TYPE_COLORS[bookingType.id]?.bg ?? "#427a5c",
                }}
              />
              <span>{bookingType.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin size={13} className="shrink-0" />
            <span>Osobne</span>
          </div>
        </div>

        <div className="flex lg:hidden items-center justify-end gap-2">
          <button className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700 transition-colors">
            <Video size={13} />
            <span>Pripojiť sa</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:bg-surface-50 transition-colors">
              <MoreHorizontal size={13} />
              <span>Akcie</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setConfirmDialog("finished")}>
                <Check size={13} />
                Absolvované
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <MessageSquare size={13} />
                Poznámka
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil size={13} />
                Upraviť
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => setConfirmDialog("cancelled")}
              >
                <X size={13} />
                Zrušiť
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </AdminCard>

      <BookingDialog
        open={editOpen}
        booking={booking}
        users={users}
        bookingTypes={bookingTypes}
        onSave={handleSave}
        onDelete={() => {
          setEditOpen(false);
          setConfirmDialog("cancelled");
        }}
        onClose={() => setEditOpen(false)}
        onUserCreated={() => {}}
      />

      <Dialog
        open={confirmDialog !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{config?.title}</DialogTitle>
            <DialogDescription>
              {config?.description(clientName)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isPending}
            >
              Späť
            </DialogClose>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className={config?.className}
            >
              {isPending ? "Ukladám..." : config?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
