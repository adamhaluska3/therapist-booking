import { createColumnHelper } from "@tanstack/react-table"
import type { Booking } from "@/db/schema"
import { formatTime, formatBookingDate } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"

interface ActionHandlers {
  onConfirm: (id: string) => void
  onCancel: (booking: Booking) => void
  isPending: boolean
}

const columnHelper = createColumnHelper<Booking>()

export function getRequestsColumns({ onConfirm, onCancel, isPending }: ActionHandlers) {
  return [
    columnHelper.accessor("clientName", {
      header: "Klient",
      cell: (info) => {
        const clientName = info.getValue() ?? "Neznámy klient"
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {getInitials(clientName)}
            </div>
            <span className="font-medium text-neutral-800">{clientName}</span>
          </div>
        )
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
      id: "actions",
      header: "Akcie",
      enableSorting: false,
      cell: (info) => {
        const booking = info.row.original
        return (
          <div className="flex items-center justify-end gap-2">
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
