import Link from "next/link";
import { Lora } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} min-h-screen bg-surface-50`}
      style={
        { "--font-serif": "var(--font-lora, ui-serif)" } as React.CSSProperties
      }
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-50/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <Link
            href="/"
            className="font-serif text-lg font-semibold italic text-brand-900"
          >
            Terapeut - Ján Šolc
          </Link>

          <nav className="flex items-center gap-8">
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

          <Button className="rounded-full bg-brand-700 px-5 text-white hover:bg-brand-800">
            Prihlásiť sa
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer>
        <div className="mx-auto max-w-6xl px-8 py-16">
          <Separator className="my-8 bg-surface-200" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              © {new Date().getFullYear()} Ján Šolc
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
