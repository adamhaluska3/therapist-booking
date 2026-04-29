import type { Metadata } from "next";
import { UserProvider, type User } from "@/lib/user-context";
import { auth } from "@/lib/auth";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Therapist Booking",
  description: "Book appointments with qualified therapists.",
};

async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "User",
    role: (session.user.role ?? "user") as User["role"],
    email: session.user.email,
    avatarUrl: session.user.image ?? undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="sk" className={cn("font-sans", geist.variable)}>
      <body>
        <UserProvider user={user}>{children}</UserProvider>
      </body>
    </html>
  );
}
