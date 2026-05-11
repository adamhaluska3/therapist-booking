import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex w-full flex-wrap items-center">
        <div className="flex-1">
          <Skeleton className="mb-1 h-3 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="flex gap-5">
          <Skeleton className="h-9 w-36 rounded-2xl" />
          <Skeleton className="h-9 w-36 rounded-2xl" />
        </div>
      </div>

      <div className="my-5 flex gap-3">
        <Skeleton className="h-8 w-44 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              {["Titulok", "Kategória", "Stav", "Dátum", ""].map((col) => (
                <th key={col} className="px-4 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </td>
                <td className="px-4 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-4"><Skeleton className="h-4 w-12 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
