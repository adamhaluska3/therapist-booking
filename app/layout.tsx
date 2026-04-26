import type { Metadata } from "next";
import { UserProvider, type User } from "@/lib/user-context";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Therapist Booking",
  description: "Book appointments with qualified therapists.",
};

// TODO: replace with a real session lookup
async function getCurrentUser(): Promise<User | null> {
  return null;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <UserProvider user={user}>{children}</UserProvider>
      </body>
    </html>
  );
}
