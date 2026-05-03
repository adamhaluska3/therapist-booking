import { Lora } from "next/font/google"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { QueryProvider } from "@/components/providers/query-provider"
import { getPendingCount } from "@/server/queries"

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pendingCount = await getPendingCount()

  return (
    <div
      className={`${lora.variable} flex min-h-screen flex-col md:flex-row`}
      style={{ "--font-serif": "var(--font-lora, ui-serif)" } as React.CSSProperties}
    >
      <AdminSidebar pendingCount={pendingCount} />
      <main className="flex-1 p-4 md:p-6">
        <QueryProvider>{children}</QueryProvider>
      </main>
    </div>
  )
}
