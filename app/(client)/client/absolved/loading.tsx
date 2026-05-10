import { Skeleton } from "@/components/ui/skeleton";

export default function AbsolvedLoading() {
  return (
    <article className="bg-linear-to-b from-white to-surface-100">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
        <section className="mb-8">
          <Skeleton className="mb-4 h-10 w-56 md:h-14 md:w-72" />
          <Skeleton className="h-4 w-64" />
        </section>

        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <Skeleton className="h-3 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-4 text-right">
                    <Skeleton className="h-8 w-20 rounded-full ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
