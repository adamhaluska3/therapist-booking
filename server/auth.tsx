"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/user-context";

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth-error?reason=unauthorized");
  return session.user;
}
async function requireRole(role: UserRole) {
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
