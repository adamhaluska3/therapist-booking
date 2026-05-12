import { Lora } from "next/font/google";
import { SiteHeader } from "@/components/shared/site-header";
import { Separator } from "@/components/ui/separator";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} min-h-screen bg-linear-to-b from-white to-surface-100`}
      style={
        { "--font-serif": "var(--font-lora, ui-serif)" } as React.CSSProperties
      }
    >
      <SiteHeader />
      <main>{children}</main>

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
