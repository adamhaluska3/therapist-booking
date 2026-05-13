import { Skeleton } from "@/components/ui/skeleton";

export default function PostCategoriesLoading() {
  return (
    <article className="mx-auto max-w-5xl">
      <section className="mb-8 flex w-full flex-wrap items-center">
        <div className="flex-1">
          <Skeleton className="mb-1 h-3 w-24" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-9 w-36 rounded-2xl" />
      </section>

      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              {["Názov", "Akcia"].map((col) => (
                <th key={col} className="px-4 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
