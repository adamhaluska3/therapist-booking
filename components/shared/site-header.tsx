"use client";

import Link from "next/link";
import { AuthControls } from "@/components/marketing/auth-controls";
import { useUser } from "@/lib/user-context";
import { HeaderLink } from "./header-link";

export function SiteHeader() {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-50 bg-surface-50/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link
          href="/"
          className="font-serif text-lg font-semibold italic text-brand-900"
        >
          Terapeut - Ján Šolc
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <HeaderLink label="Domov" href="/" />
          <HeaderLink label="Blog" href="/blog" />
          <HeaderLink label="Rezervácie" href="/booking" />
          {user?.role === "admin" && <HeaderLink label="Admin" href="/admin" />}
          {user?.role === "user" && (
            <HeaderLink label="Sedenia" href="/client" />
          )}
        </nav>

        <AuthControls />
      </div>
    </header>
  );
}
