"use client";

import { createContext, useContext, type ReactNode } from "react";

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
};

type UserContextValue = {
  user: User | null;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User | null;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be called inside <UserProvider>");
  return ctx;
}
