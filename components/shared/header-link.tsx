"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function HeaderLink({ label, href }: { label: string; href: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors hover:text-brand-700",
        isActive ? "font-medium text-brand-700" : "text-neutral-600",
      )}
    >
      {label}
    </Link>
  );
}
