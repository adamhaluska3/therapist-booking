"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/user-context";

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}
async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role)
    throw new Error(
      "Forbidden, required role: " + role + ", current role: " + user.role,
    );
  return user;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireUser() {
  return requireRole("user");
}
