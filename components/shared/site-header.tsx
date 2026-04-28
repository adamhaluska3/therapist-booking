import Link from "next/link"
import { AuthControls } from "@/components/marketing/auth-controls"

export function SiteHeader() {
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
          <Link
            href="/"
            className="text-sm text-neutral-600 transition-colors hover:text-brand-700"
          >
            Domov
          </Link>
          <Link
            href="/blog"
            className="text-sm text-neutral-600 transition-colors hover:text-brand-700"
          >
            Blog
          </Link>
          <Link
            href="/booking"
            className="text-sm text-neutral-600 transition-colors hover:text-brand-700"
          >
            Rezervácie
          </Link>
        </nav>

        <AuthControls />
      </div>
    </header>
  )
}
