import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        <div className="w-full lg:col-span-4">
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 lg:col-span-8">
          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <Skeleton className="mb-4 h-6 w-36" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-6">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
