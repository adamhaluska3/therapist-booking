import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function AdminCard({ className, children }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-white border border-surface-200 px-5 py-4 shadow-sm sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
