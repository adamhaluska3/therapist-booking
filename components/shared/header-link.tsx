"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function HeaderLink({
  label,
  href,
  variant = "desktop",
  onClick,
}: {
  label: string;
  href: string;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-md text-sm transition-colors hover:bg-surface-100 hover:text-brand-700",
        variant === "desktop" ? "-mx-3 px-3 py-1.5" : "px-3 py-2.5",
        isActive ? "bg-surface-100 font-medium text-brand-700" : "text-neutral-600",
      )}
    >
      {label}
    </Link>
  );
}
