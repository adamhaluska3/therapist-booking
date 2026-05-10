import { cn } from "@/lib/utils"

export const SmallInfoText = ({
  content,
  className,
}: {
  content: string
  className?: string
}) => (
  <p className={cn("mb-8 max-w-lg text-sm leading-relaxed text-neutral-500 md:mb-10", className)}>
    {content}
  </p>
)