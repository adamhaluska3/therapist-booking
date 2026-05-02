"use client"

import Link from "next/link"
import { Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { sk } from "date-fns/locale"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { Booking } from "@/db/schema"
import { formatTime, formatMonthShort } from "@/lib/date-utils"
import { getInitials } from "@/lib/formatting"
import { fetchFinishedBookings } from "@/server/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type MonthGroup = {
  label: string
  bookings: Booking[]
}

function groupByMonth(bookings: Booking[]): MonthGroup[] {
  const map = new Map<string, Booking[]>()

  for (const b of bookings) {
    const key = format(b.start, "yyyy-MM")
    const arr = map.get(key) ?? []
    arr.push(b)
    map.set(key, arr)
  }

  return Array.from(map.entries()).map(([key, items]) => ({
    label: format(new Date(key + "-01"), "LLLL", { locale: sk }),
    bookings: items,
  }))
}

function ArchiveCard({ booking }: { booking: Booking }) {
  const clientName = booking.clientName ?? "Neznámy klient"
  const isLinked = Boolean(booking.userId)

  const inner = (
    <div className={`flex flex-col gap-3 rounded-xl bg-white border border-surface-200 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:px-6 transition-colors${isLinked ? " group-hover:border-brand-300 group-hover:bg-surface-50" : ""}`}>
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
            <Clock size={13} className="shrink-0 text-neutral-400" />
            <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
          </div>
        </div>

        <div className="flex items-center sm:ml-auto">
          <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium">
            Absolvované
          </Badge>
        </div>
      </div>
    </div>
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

export function SessionsArchiveView() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["finished-bookings"],
      queryFn: ({ pageParam }) => fetchFinishedBookings(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
    })

  const allBookings = data?.pages.flatMap((p) => p.bookings) ?? []
  const groups = groupByMonth(allBookings)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
          Archív záznamov
        </p>
        <h1
          className="font-serif text-4xl font-bold text-neutral-800"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Prehľad dokončených terapií
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-neutral-400 py-12 text-center">
          Žiadne dokončené sedenia.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ label, bookings: items }) => (
            <section key={label}>
              <h2
                className="text-xl font-serif font-semibold text-neutral-600 mb-4 capitalize"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {label}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((b) => (
                  <ArchiveCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Načítavam...
              </>
            ) : (
              "Načítať viac"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
