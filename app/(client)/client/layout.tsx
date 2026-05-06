import { Lora } from "next/font/google";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/shared/site-header";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export default function BookingLayout({
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
      <SiteHeader />

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer>
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
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
