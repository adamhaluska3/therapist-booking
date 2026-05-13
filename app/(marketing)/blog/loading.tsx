import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPublicLoading() {
  return (
    <>
      <section className="bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="mb-4 h-10 w-48 md:h-12 md:w-64" />
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linear-to-b from-white to-surface-100 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-surface-200 bg-white"
              >
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-5">
                  <Skeleton className="mb-2 h-5 w-20 rounded-full" />
                  <Skeleton className="mb-1 h-6 w-full" />
                  <Skeleton className="mb-3 h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
