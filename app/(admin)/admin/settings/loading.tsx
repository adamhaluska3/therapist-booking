import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Skeleton className="mb-1 h-3 w-20" />
        <Skeleton className="mb-1 h-10 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex flex-col gap-8">
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="mt-2 h-10 w-32 rounded-lg" />
          </div>
        </div>

        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <Skeleton className="mb-4 h-6 w-44" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-surface-200 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-4 h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
