import { cn } from "@/lib/utils";

export const MediumInfoText = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => (
  <p
    className={cn(
      "mb-8 max-w-lg leading-relaxed text-neutral-500 md:mb-10",
      className,
    )}
  >
    {content}
  </p>
);
