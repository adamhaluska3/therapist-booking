import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Skeleton className="mb-1 h-3 w-24" />
        <Skeleton className="mb-2 h-10 w-72" />
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-surface-200 bg-white px-6 py-4 shadow-sm">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      <div className="hidden lg:block overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
