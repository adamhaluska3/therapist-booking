import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <section className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-6">
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-9 w-64 rounded-full" />
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-surface-100">
            <tr>
              {[
                "Meno klienta",
                "Posledné sedenie",
                "Počet sedení",
                "Akcia",
              ].map((col) => (
                <th key={col} className="px-4 py-3">
                  <Skeleton className="h-3 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-t border-surface-200">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
