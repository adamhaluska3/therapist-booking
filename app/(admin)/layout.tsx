import { Lora } from "next/font/google"
import { SiteHeader } from "@/components/shared/site-header"

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${lora.variable} min-h-screen`}
      style={{ "--font-serif": "var(--font-lora, ui-serif)" } as React.CSSProperties}
    >
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
