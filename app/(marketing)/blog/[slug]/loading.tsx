import { Skeleton } from "@/components/ui/skeleton";

export default function BlogDetailLoading() {
  return (
    <>
      <section className="bg-linear-to-b from-white to-surface-100">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-12 md:px-8 md:pb-12 md:pt-20">
          <Skeleton className="mb-8 h-4 w-24" />
          <Skeleton className="mb-4 h-3 w-20" />
          <Skeleton className="mb-3 h-4 w-16" />
          <Skeleton className="mb-2 h-10 w-full md:h-12" />
          <Skeleton className="h-10 w-3/4 md:h-12" />
        </div>
      </section>

      <section className="bg-surface-100">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        </div>
      </section>

      <section className="bg-linear-to-b from-surface-100 to-surface-50">
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 md:px-8">
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-8 h-4 w-2/3" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </section>
    </>
  );
}
