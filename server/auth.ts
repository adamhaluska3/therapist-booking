"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth-error?reason=unauthorized");
  return session.user;
}
async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) redirect("/auth-error?reason=forbidden");
  return user;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireUser() {
  return requireRole("user");
}
