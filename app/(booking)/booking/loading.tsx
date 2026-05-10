import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <section className="bg-linear-to-b from-white to-surface-100">
      <div className="mx-auto max-w-6xl px-8 pb-16 pt-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
          <div>
            <Skeleton className="mb-3 h-10 w-3/4" />
            <Skeleton className="mb-10 h-4 w-1/2" />
            <div className="rounded-xl border border-surface-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="mb-2 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, row) => (
                <div key={row} className="mb-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, col) => (
                    <Skeleton key={col} className="h-9 w-full rounded-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-surface-200 bg-white p-6">
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
