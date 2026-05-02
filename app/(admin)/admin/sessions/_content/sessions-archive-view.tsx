"use client"

import { Loader2 } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { groupByMonth } from "@/lib/date-utils"
import { fetchFinishedBookings } from "@/server/actions"
import { ArchiveCard } from "@/components/admin/archive-card"
import { Button } from "@/components/ui/button"

export function SessionsArchiveView() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
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
        <h1 className="font-serif text-4xl font-bold text-neutral-800 [font-family:var(--font-serif)]">
          Prehľad dokončených terapií
        </h1>
      </div>

      {isError ? (
        <p className="text-sm text-red-500 py-12 text-center">
          Nepodarilo sa načítať záznamy. Skúste obnoviť stránku.
        </p>
      ) : isLoading ? (
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
              <h2 className="text-xl font-serif font-semibold text-neutral-600 mb-4 capitalize [font-family:var(--font-serif)]">
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
