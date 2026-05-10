"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Hash,
  MessageSquare,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { formatTime, formatBookingDate } from "@/lib/date-utils";
import { getInitials } from "@/lib/formatting";
import { BOOKINGS_PAGE_SIZE, UNKNOWN_CLIENT } from "@/lib/constants";
import {
  confirmBooking,
  updateBookingStatus,
} from "@/server/booking/mutations";
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
import { PaginationControls } from "@/components/admin/pagination-controls";
import { getRequestsColumns } from "@/components/admin/requests-columns";
import { BookingWithUser } from "@/server/booking/schema";
import { BookingType } from "@/db/schema";
import { BOOKING_TYPE_COLORS } from "./calendar-event-card";
import { toast } from "sonner";

interface Props {
  bookings: BookingWithUser[];
  total: number;
  page: number;
  bookingTypes: BookingType[];
}

export function RequestsView({ bookings, total, page, bookingTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [cancelTarget, setCancelTarget] = useState<BookingWithUser | null>(
    null,
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const totalPages = Math.max(1, Math.ceil(total / BOOKINGS_PAGE_SIZE));
  const rangeStart =
    bookings.length === 0 ? 0 : (page - 1) * BOOKINGS_PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * BOOKINGS_PAGE_SIZE + bookings.length;

  function navigatePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/admin/requests?${params}`);
  }

  const handleConfirm = useCallback(
    (id: string) => {
      startTransition(async () => {
        try {
          await confirmBooking(id);
          router.refresh();
          toast.success("Žiadosť potvrdená");
        } catch (e) {
          console.error(e);
          toast.error("Nepodarilo sa potvrdiť žiadosť");
        }
      });
    },
    [router],
  );

  const handleCancelOpen = useCallback((booking: BookingWithUser) => {
    setCancelTarget(booking);
  }, []);

  function handleCancelConfirm() {
    if (!cancelTarget) return;
    startTransition(async () => {
      try {
        await updateBookingStatus(cancelTarget.id, "cancelled");
        setCancelTarget(null);
        router.refresh();
        toast.success("Žiadosť zrušená");
      } catch (e) {
        console.error(e);
        toast.error("Nepodarilo sa zrušiť žiadosť");
      }
    });
  }

  const columns = getRequestsColumns({
    onConfirm: handleConfirm,
    onCancel: handleCancelOpen,
    isPending,
    bookingTypes,
  });

  const table = useReactTable({
    data: bookings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
          Administratíva
        </p>
        <h1 className="font-serif text-4xl font-bold text-neutral-800 mb-2">
          Nové žiadosti o terapiu
        </h1>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-surface-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
          <ClipboardList size={22} className="text-brand-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-neutral-800">
            Čakajúce žiadosti: {total}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Celkový počet nespracovaných žiadostí
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {bookings.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">
            Žiadne nové žiadosti
          </p>
        )}
        {bookings.map((b) => {
          const clientName = b.user?.nickname ?? b.user?.name ?? UNKNOWN_CLIENT;
          const bookingType =
            bookingTypes.find((t) => t.id === b.bookingTypeId) ?? null;
          const clientBlock = (
            <div className="flex items-center gap-3 flex-1 min-w-0 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {getInitials(clientName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-neutral-800 group-hover:text-brand-700 transition-colors">
                  {clientName}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {formatBookingDate(b.start)}, {formatTime(b.start)} –{" "}
                  {formatTime(b.end)}
                </p>
                <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                  <Hash size={11} className="shrink-0" />
                  <span>2400001</span>
                </div>
              </div>
            </div>
          );
          return (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl border border-surface-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-start gap-2">
                {b.userId ? (
                  <Link
                    href={`/admin/clients/${b.userId}`}
                    className="flex-1 min-w-0"
                  >
                    {clientBlock}
                  </Link>
                ) : (
                  <div className="flex-1 min-w-0">{clientBlock}</div>
                )}
                <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                  {bookingType && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            BOOKING_TYPE_COLORS[bookingType.id]?.bg ??
                            "#427a5c",
                        }}
                      />
                      <span>{bookingType.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <MapPin size={11} className="shrink-0" />
                    <span>Osobne</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
                >
                  <MessageSquare size={13} />
                  Poznámka
                </button>
                <button
                  onClick={() => handleConfirm(b.id)}
                  disabled={isPending}
                  className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                >
                  Potvrdiť
                </button>
                <button
                  onClick={() => handleCancelOpen(b)}
                  disabled={isPending}
                  className="rounded-full border border-surface-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 lg:hidden">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={total}
          isPending={isPending}
          onNavigate={navigatePage}
        />
      </div>

      <div className="hidden lg:block overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-surface-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400 last:text-right"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-neutral-600 transition-colors"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ArrowUp size={12} />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ArrowDown size={12} />
                        )}
                        {!header.column.getIsSorted() && (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-surface-100">
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-neutral-400"
                >
                  Žiadne nové žiadosti
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-surface-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 last:text-right">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-surface-100 px-6 py-3">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={total}
            isPending={isPending}
            onNavigate={navigatePage}
          />
        </div>
      </div>

      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Zrušiť žiadosť?</DialogTitle>
            <DialogDescription>
              Žiadosť klienta{" "}
              <span className="font-medium text-neutral-800">
                {cancelTarget?.user?.nickname ??
                  cancelTarget?.user?.name ??
                  UNKNOWN_CLIENT}
              </span>{" "}
              bude zamietnutá a označená ako zrušená.
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
              onClick={handleCancelConfirm}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "Ukladám..." : "Zrušiť žiadosť"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
