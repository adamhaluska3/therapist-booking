"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Calendar,
  Bell,
  History,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  LucideBookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/user-context";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const navItems = [
  { label: "Prehľad", href: "/admin", icon: LayoutGrid },
  { label: "Kalendár", href: "/admin/calendar", icon: Calendar },
  {
    label: "Žiadosti",
    href: "/admin/requests",
    icon: Bell,
    badgeKey: "pending" as const,
  },
  { label: "História sedení", href: "/admin/sessions", icon: History },
  { label: "Klienti", href: "/admin/clients", icon: Users },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Kategórie príspevkov", href: "/admin/post-categories", icon: LucideBookmark },
  { label: "Nastavenia", href: "/admin/settings", icon: Settings },
];

function SidebarContent({
  onNavigate,
  pendingCount = 0,
}: {
  onNavigate?: () => void;
  pendingCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await authClient.signOut();
        router.push("/");
        router.refresh();
        toast.success("Úspešne odhlásený");
      } catch (e) {
        console.error(e);
        toast.error("Nepodarilo sa odhlásiť");
      }
    });
  };

  return (
    <>
      <div className="px-6 pt-8 pb-6">
        <p className="text-lg font-semibold text-neutral-800 leading-tight">
          Admin Portal
        </p>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const badge = item.badgeKey === "pending" ? pendingCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-surface-100",
                isActive
                  ? "bg-brand-100 font-semibold text-brand-700"
                  : "font-normal text-neutral-500 hover:text-neutral-700",
              )}
            >
              <span className="relative shrink-0">
                <Icon
                  size={18}
                  className={cn(
                    isActive ? "text-brand-600" : "text-neutral-400",
                  )}
                />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 mt-4 border-t border-surface-200 pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-normal text-neutral-500 transition-colors hover:bg-surface-100 hover:text-neutral-700"
        >
          <Globe size={18} className="text-neutral-400" />
          Verejné stránky
        </Link>
      </div>

      <div className="mt-auto border-t border-surface-200 p-4">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="shrink-0 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-surface-100 hover:text-neutral-700 disabled:opacity-50"
              title="Odhlásiť sa"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function AdminSidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-surface-200 bg-surface-50 flex-col border-l-4 border-l-brand-600 sticky top-0 h-screen">
        <SidebarContent pendingCount={pendingCount} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center gap-3 border-b border-surface-200 bg-surface-50 px-4 py-3 sticky top-0 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md p-1.5 text-neutral-600 hover:bg-surface-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <p className="font-semibold text-neutral-800 text-sm">Admin Portal</p>
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-surface-200 bg-surface-50 border-l-4 border-l-brand-600 transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-end p-3 border-b border-surface-200">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-surface-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent
          pendingCount={pendingCount}
          onNavigate={() => setIsOpen(false)}
        />
      </aside>
    </>
  );
}
