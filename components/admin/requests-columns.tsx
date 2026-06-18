import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { formatTime, formatBookingDate } from "@/lib/date-utils";
import { getInitials, formatPrice } from "@/lib/formatting";
import {
  BOOKING_TYPE_COLORS,
  UNKNOWN_CLIENT,
  DEFAULT_THERAPY_COLOR,
} from "@/lib/constants";
import { MessageSquare, Check, X } from "lucide-react";
import { LocationBadge } from "@/components/booking/location-badge";
import { BookingWithUser } from "@/server/booking/schema";

interface ActionHandlers {
  onConfirm: (id: string) => void;
  onCancel: (booking: BookingWithUser) => void;
  onNote: (booking: BookingWithUser) => void;
  isPending: boolean;
}

const columnHelper = createColumnHelper<BookingWithUser>();

export function getRequestsColumns({
  onConfirm,
  onCancel,
  onNote,
  isPending,
}: ActionHandlers) {
  return [
    columnHelper.display({
      id: "client",
      header: "Klient",
      cell: (info) => {
        const booking = info.row.original;
        const clientName =
          booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT;
        const bookingType = booking.bookingType;
        const inner = (
          <div className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {getInitials(clientName)}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-neutral-800 group-hover:text-brand-700 transition-colors">
                {clientName}
              </span>
              {bookingType && (
                <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        BOOKING_TYPE_COLORS[bookingType.id]?.bg ??
                        DEFAULT_THERAPY_COLOR,
                    }}
                  />
                  <span className="truncate">{bookingType.name}</span>
                </div>
              )}
              <LocationBadge
                locationType={booking.locationType}
                size={11}
                className="text-xs text-neutral-400"
              />
            </div>
          </div>
        );
        return booking.userId ? (
          <Link href={`/admin/clients/${booking.userId}`}>{inner}</Link>
        ) : (
          inner
        );
      },
    }),
    columnHelper.accessor("start", {
      header: "Termín",
      cell: (info) => {
        const start = info.getValue();
        const end = info.row.original.end;
        return (
          <>
            <p className="font-medium text-neutral-800">
              {formatBookingDate(start)}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {formatTime(start)} – {formatTime(end)}
            </p>
          </>
        );
      },
    }),
    columnHelper.display({
      id: "variableSymbol",
      header: "Var. symbol",
      cell: (info) => {
        const price = formatPrice(info.row.original.price);
        return (
          <>
            <p className="text-sm text-neutral-600">
              {info.row.original.variableSymbol}
            </p>
            {price && (
              <p className="text-xs text-neutral-400 mt-0.5">{price}</p>
            )}
          </>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Akcie",
      enableSorting: false,
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onNote(booking)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
            >
              <MessageSquare size={13} />
              Poznámka
            </button>
            <button
              onClick={() => onConfirm(booking.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              <Check size={12} />
              Potvrdiť
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full border border-surface-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
            >
              <X size={12} />
              Zrušiť
            </button>
          </div>
        );
      },
    }),
  ];
}
