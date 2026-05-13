import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <section className="bg-linear-to-b from-white to-surface-100">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
        <div className="relative mb-12 md:mb-16">
          <div className="max-w-xl">
            <Skeleton className="mb-4 h-12 w-56 md:h-14 md:w-72" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-5/6" />
            <Skeleton className="mb-6 h-4 w-3/4" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <div className="divide-y divide-surface-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-5"
              >
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
