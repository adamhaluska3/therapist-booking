import Link from "next/link"
import { Clock } from "lucide-react"
import type { BookingWithUser } from "@/db/schema"
import { formatTime, formatMonthShort } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"
import { UNKNOWN_CLIENT } from "@/lib/constants"
import { AdminCard } from "@/components/admin/admin-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ArchiveCard({ booking }: { booking: BookingWithUser }) {
  const clientName = booking.user?.nickname ?? booking.user?.name ?? UNKNOWN_CLIENT
  const isLinked = Boolean(booking.userId)

  const inner = (
    <AdminCard
      className={cn(
        "sm:flex-row sm:items-center sm:gap-6 transition-colors",
        isLinked && "group-hover:border-brand-300 group-hover:bg-surface-50",
      )}
    >
      <div className="flex items-center gap-4 sm:contents">
        <div className="w-12 shrink-0 text-center sm:w-16 sm:border-r sm:border-surface-200 sm:pr-6">
          <p className="text-2xl font-bold text-neutral-800 leading-none sm:text-3xl">
            {booking.start.getDate()}
          </p>
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">
            {formatMonthShort(booking.start)}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:w-52 sm:flex-none sm:shrink-0">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
            {getInitials(clientName)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase mb-0.5">
              Klient
            </p>
            <p className="font-semibold text-neutral-800 text-sm leading-tight truncate">
              {clientName}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase mb-0.5">
            Čas
          </p>
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <Clock size={11} className="shrink-0 text-neutral-400" />
            <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
          </div>
        </div>

        <div className="flex items-center sm:ml-auto">
          <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium">
            Absolvované
          </Badge>
        </div>
      </div>
    </AdminCard>
  )

  if (booking.userId) {
    return (
      <Link href={`/admin/clients/${booking.userId}`} className="group block">
        {inner}
      </Link>
    )
  }

  return inner
}
