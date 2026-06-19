import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | V Rozhovore",
    default: "V Rozhovore",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" className={cn("font-sans", geist.variable)}>
      <body>
        <Toaster richColors theme="light" />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
