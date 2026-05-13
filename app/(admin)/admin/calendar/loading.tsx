import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
        <div className="grid grid-cols-8 border-b border-surface-200">
          <div className="border-r border-surface-200 p-3" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-r border-surface-200 p-3 last:border-r-0">
              <Skeleton className="mx-auto h-4 w-8" />
              <Skeleton className="mx-auto mt-1 h-7 w-7 rounded-full" />
            </div>
          ))}
        </div>

        {Array.from({ length: 10 }).map((_, row) => (
          <div key={row} className="grid grid-cols-8 border-b border-surface-200 last:border-b-0">
            <div className="border-r border-surface-200 p-3">
              <Skeleton className="ml-auto h-3 w-10" />
            </div>
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="min-h-14 border-r border-surface-200 p-1 last:border-r-0">
                {row % 3 === 0 && col % 2 === 1 && (
                  <Skeleton className="h-8 w-full rounded-md" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
