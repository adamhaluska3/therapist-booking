"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function RedirectBackButton({
  label = "Späť",
  href = "/",
}: {
  label?: string;
  href?: string;
}) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (history.length > 1) {
      e.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
      onClick={handleClick}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="ml-2">{label}</span>
    </Link>
  );
}
