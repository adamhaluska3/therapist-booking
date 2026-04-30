import { Lora } from "next/font/google"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${lora.variable} flex min-h-screen flex-col md:flex-row`}
      style={{ "--font-serif": "var(--font-lora, ui-serif)" } as React.CSSProperties}
    >
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
