import { Suspense } from "react";
import { Lora } from "next/font/google";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSidebarLoader } from "@/components/admin/admin-sidebar-loader";
import { QueryProvider } from "@/components/providers/query-provider";
import { Metadata } from "next";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: {
    template: "%s | V Rozhovore Admin",
    default: "V Rozhovore Admin",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} flex min-h-screen flex-col md:flex-row`}
      style={
        { "--font-serif": "var(--font-lora, ui-serif)" } as React.CSSProperties
      }
    >
      <Suspense fallback={<AdminSidebar />}>
        <AdminSidebarLoader />
      </Suspense>
      <main className="flex-1 p-4 md:p-6">
        <QueryProvider>{children}</QueryProvider>
      </main>
    </div>
  );
}
