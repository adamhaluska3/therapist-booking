import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"
import type { BookingWithUser, BookingType } from "@/db/schema"
import { formatTime, formatBookingDate } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"
import { UNKNOWN_CLIENT } from "@/lib/constants"
import { BOOKING_TYPE_COLORS } from "@/components/admin/calendar-event-card"
import { MapPin, MessageSquare } from "lucide-react"

interface ActionHandlers {
  onConfirm: (id: string) => void
  onCancel: (booking: BookingWithUser) => void
  isPending: boolean
  bookingTypes: BookingType[]
}

const columnHelper = createColumnHelper<BookingWithUser>()

export function getRequestsColumns({ onConfirm, onCancel, isPending, bookingTypes }: ActionHandlers) {
  return [
    columnHelper.display({
      id: "client",
      header: "Klient",
      cell: (info) => {
        const booking = info.row.original
        const clientName = booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT
        const bookingType = bookingTypes.find((t) => t.id === booking.bookingTypeId) ?? null
        const inner = (
          <div className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {getInitials(clientName)}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-neutral-800 group-hover:text-brand-700 transition-colors">{clientName}</span>
              {bookingType && (
                <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: BOOKING_TYPE_COLORS[bookingType.id]?.bg ?? "#427a5c" }}
                  />
                  <span className="truncate">{bookingType.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                <MapPin size={11} className="shrink-0" />
                <span>Osobne</span>
              </div>
            </div>
          </div>
        )
        return booking.userId
          ? <Link href={`/admin/clients/${booking.userId}`}>{inner}</Link>
          : inner
      },
    }),
    columnHelper.accessor("start", {
      header: "Termín",
      cell: (info) => {
        const start = info.getValue()
        const end = info.row.original.end
        return (
          <>
            <p className="font-medium text-neutral-800">{formatBookingDate(start)}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {formatTime(start)} – {formatTime(end)}
            </p>
          </>
        )
      },
    }),
    columnHelper.display({
      id: "variableSymbol",
      header: "Var. symbol",
      cell: () => (
        <p className="text-sm text-neutral-600">2400001</p>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Akcie",
      enableSorting: false,
      cell: (info) => {
        const booking = info.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
            >
              <MessageSquare size={13} />
              Poznámka
            </button>
            <button
              onClick={() => onConfirm(booking.id)}
              disabled={isPending}
              className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              Potvrdiť
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isPending}
              className="rounded-full border border-surface-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-50 disabled:opacity-50"
            >
              Zrušiť
            </button>
          </div>
        )
      },
    }),
  ]
}
