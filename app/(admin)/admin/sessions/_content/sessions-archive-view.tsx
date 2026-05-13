"use client";

import { Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { groupByMonth } from "@/lib/date-utils";
import { getFinishedBookingsPaginated } from "@/server/booking/queries";
import { ArchiveCard } from "@/components/admin/archive-card";
import { Button } from "@/components/ui/button";
import type { BookingType } from "@/db/schema";

export function SessionsArchiveView({
  bookingTypes,
}: {
  bookingTypes: BookingType[];
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["finished-bookings"],
    queryFn: ({ pageParam }) => getFinishedBookingsPaginated(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const allBookings = data?.pages.flatMap((p) => p.bookings) ?? [];
  const groups = groupByMonth(allBookings);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-neutral-800 mb-2">
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
              <h2 className="text-xl font-serif font-semibold text-neutral-600 mb-4 capitalize">
                {label}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((b) => (
                  <ArchiveCard
                    key={b.id}
                    booking={b}
                    bookingTypes={bookingTypes}
                  />
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
  );
}
