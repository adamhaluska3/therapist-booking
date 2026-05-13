import { Skeleton } from "@/components/ui/skeleton";

export default function NewPostLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="mb-4 h-4 w-36" />
      <Skeleton className="mb-5 h-10 w-56" />
      <PostEditorSkeleton />
    </div>
  );
}

function PostEditorSkeleton() {
  return (
    <article>
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-2xl md:max-w-150" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-20 w-full rounded-2xl md:max-w-150" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-44 rounded-lg" />
          </div>
        </div>
        <div className="flex w-full flex-col md:w-100">
          <Skeleton className="mb-4 h-3 w-28" />
          <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        </div>
      </div>

      <Skeleton className="mt-5 h-64 w-full rounded-xl" />

      <div className="mt-5 flex justify-end gap-3">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-9 w-52 rounded-2xl" />
      </div>
    </article>
  );
}
