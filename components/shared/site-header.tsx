"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AuthControls } from "@/components/marketing/auth-controls";
import { useUser } from "@/lib/user-context";
import { HeaderLink } from "./header-link";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Domov", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Cenník", href: "/pricing" },
    { label: "Rezervácie", href: "/booking" },
    ...(user?.role === "admin" ? [{ label: "Admin", href: "/admin" }] : []),
    ...(user?.role === "user" ? [{ label: "Sedenia", href: "/client" }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface-50/80 backdrop-blur-sm">
        <div className="mx-auto relative flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <button
            className="rounded-md p-1.5 text-neutral-600 hover:bg-surface-100 transition-colors md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Link
            href="/"
            className="font-serif text-lg font-semibold italic text-brand-900"
          >
            V Rozhovore - Ján Šolc
          </Link>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {navLinks.map((link) => (
              <HeaderLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AuthControls />
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-surface-200 bg-surface-50 transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-4 py-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="font-serif text-lg font-semibold italic text-brand-900"
          >
            V Rozhovore - Ján Šolc
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-surface-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navLinks.map((link) => (
            <HeaderLink
              key={link.href}
              href={link.href}
              label={link.label}
              variant="mobile"
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
