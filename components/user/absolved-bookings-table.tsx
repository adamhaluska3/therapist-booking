"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Clock, Check, NotebookText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentSettings } from "@/db/schema";
import { PaymentInfoDialog } from "./payment-info-dialog";
import { NoteDialog } from "./note-dialog";
import { AdminCard } from "@/components/admin/admin-card";
import { ClientAbsolvedBookingRow } from "@/server/booking/schema";
import { Badge } from "@/components/ui/badge";
import { LocationBadge } from "@/components/booking/location-badge";
import { groupByMonth, formatTime, formatMonthShort } from "@/lib/date-utils";
import { getClientAbsolvedBookingsAction } from "@/server/booking/actions";

export type ClientAbsolvedBookingMonthFilter = "all" | "month" | "last_month";

const FILTERS: { key: ClientAbsolvedBookingMonthFilter; label: string }[] = [
  { key: "all", label: "Všetky" },
  { key: "month", label: "Tento mesiac" },
  { key: "last_month", label: "Minulý mesiac" },
];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getFilterRange(key: ClientAbsolvedBookingMonthFilter): { from: string; to: string } {
  const now = new Date();
  if (key === "month") {
    return {
      from: toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (key === "last_month") {
    return {
      from: toDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: toDateStr(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return { from: "", to: "" };
}

function formatPrice(cents: number | null) {
  if (!cents) return null;
  return (cents / 100).toLocaleString("sk-SK", {
    style: "currency",
    currency: "EUR",
  });
}

type Row = ClientAbsolvedBookingRow;

interface Props {
  rows: Row[];
  total: number;
  from: string;
  to: string;
  filter: ClientAbsolvedBookingMonthFilter;
  page: number;
  pageSize: number;
  paymentSettings: PaymentSettings | null;
}

export function AbsolvedBookingsTable({ rows, total, from, to, filter, page, pageSize, paymentSettings }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const navigate = (next: { from?: string; to?: string; filter?: ClientAbsolvedBookingMonthFilter | null; page?: number }) => {
    const sp = new URLSearchParams();
    const nextFrom = next.from ?? from;
    const nextTo = next.to ?? to;
    const nextFilter = "filter" in next ? next.filter : filter;
    const nextPage = next.page ?? 1;
    if (nextFrom) sp.set("from", nextFrom);
    if (nextTo) sp.set("to", nextTo);
    if (nextFilter && nextFilter !== "all") sp.set("filter", nextFilter);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const groups = groupByMonth(rows);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex gap-3 sm:items-center sm:flex-row flex-col items-start">
          <label className={cn(
            "inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm transition-colors",
            from ? "border-brand-400" : "border-surface-200",
          )}>
            <span className="text-neutral-400 text-xs font-medium shrink-0">Od</span>
            <input
              type="date"
              value={from}
              onChange={(e) => navigate({ from: e.target.value, to, filter: "all" })}
              className="outline-none text-neutral-700 bg-transparent"
            />
          </label>
          <label
            className={cn(
              "inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm transition-colors",
              to ? "border-brand-400" : "border-surface-200",
            )}
          >
            <span className="text-neutral-400 text-xs font-medium shrink-0">
              Do
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => navigate({ from, to: e.target.value, filter: "all" })}
              className="outline-none text-neutral-700 bg-transparent"
            />
          </label>
          {(from || to) && filter === "all" && (
            <button
              onClick={() => navigate({ from: "", to: "", filter: "all" })}
              className="text-xs text-brand-600 underline"
            >
              Zrušiť
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { const r = getFilterRange(f.key); navigate({ from: r.from, to: r.to, filter: f.key }); }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-surface-200 text-neutral-600 hover:bg-surface-50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {isPending ? (
        <div className="flex justify-center py-12">
          <Loader2 size={22} className="animate-spin text-neutral-300" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-400 py-10 text-center">
          Žiadne záznamy
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ label, bookings: items }) => (
            <section key={label}>
              <h2 className="text-base font-semibold text-neutral-700 mb-3 capitalize">
                {label}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((row) => (
                  <AdminCard
                    key={row.id}
                    className="lg:flex-row lg:items-center lg:gap-6"
                  >
                    {/* Mobile layout */}
                    <div className="lg:hidden flex items-start gap-3">
                      <div className="w-12 shrink-0 text-center border-r border-surface-200 pr-3 self-stretch flex flex-col justify-center">
                        <p className="text-2xl font-bold text-neutral-800 leading-none">
                          {row.start.getDate()}
                        </p>
                        <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">
                          {formatMonthShort(row.start)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 text-sm">
                          {row.bookingTypeName ?? "—"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                          <Clock size={11} className="shrink-0" />
                          <span>
                            {formatTime(row.start)} – {formatTime(row.end)}
                          </span>
                        </div>
                        <LocationBadge
                          locationType={row.locationType}
                          size={11}
                          className="text-xs text-neutral-400 mt-0.5"
                        />
                      </div>
                    </div>
                    <div className="lg:hidden flex items-center justify-end gap-2">
                      {formatPrice(row.price) && (
                        <span className="text-xs text-neutral-500">
                          {formatPrice(row.price)}
                        </span>
                      )}
                      {row.note && (
                        <NoteDialog note={row.note}>
                          <button className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-surface-50 transition-colors">
                            <NotebookText size={12} />
                            Poznámky
                          </button>
                        </NoteDialog>
                      )}
                      <PaymentInfoDialog
                        centPrice={row.price ?? 0}
                        vs={row.variableSymbol}
                        note={row.bookingTypeName ?? ""}
                        paymentSettings={paymentSettings}
                      >
                        <button className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-surface-50 transition-colors">
                          Platba
                        </button>
                      </PaymentInfoDialog>
                      <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium">
                        <Check size={11} />
                        Absolvované
                      </Badge>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:contents">
                      <div className="w-16 shrink-0 text-center border-r border-surface-200 pr-6">
                        <p className="text-3xl font-bold text-neutral-800 leading-none">
                          {row.start.getDate()}
                        </p>
                        <p className="text-[10px] font-medium tracking-widest text-neutral-400 mt-1">
                          {formatMonthShort(row.start)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 text-sm">
                          {row.bookingTypeName ?? "—"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Clock
                            size={11}
                            className="shrink-0 text-neutral-400"
                          />
                          <span>
                            {formatTime(row.start)} – {formatTime(row.end)}
                          </span>
                          {formatPrice(row.price) && (
                            <span className="text-neutral-400">
                              · {formatPrice(row.price)}
                            </span>
                          )}
                        </div>
                        <LocationBadge
                          locationType={row.locationType}
                          size={11}
                          className="text-xs text-neutral-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        {row.note && (
                          <NoteDialog note={row.note}>
                            <button className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-surface-50 transition-colors">
                              <NotebookText size={12} />
                              Poznámky
                            </button>
                          </NoteDialog>
                        )}
                        <PaymentInfoDialog
                          centPrice={row.price ?? 0}
                          vs={row.variableSymbol}
                          note={row.bookingTypeName ?? ""}
                          paymentSettings={paymentSettings}
                        >
                          <button className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-surface-50 transition-colors">
                            Platba
                          </button>
                        </PaymentInfoDialog>
                        <Badge className="bg-brand-100 text-brand-700 border-brand-200 px-3 py-1 h-auto text-xs font-medium">
                          <Check size={11} />
                          Absolvované
                        </Badge>
                      </div>
                    </div>
                  </AdminCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          {total === 0
            ? "Žiadne výsledky"
            : `Zobrazené ${rangeStart}–${rangeEnd} z ${total} záznamov`}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate({ page: page - 1 })}
            disabled={page <= 1 || isPending}
            className="rounded-md border border-surface-200 p-1.5 text-neutral-500 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => navigate({ page: page + 1 })}
            disabled={page >= totalPages || isPending}
            className="rounded-md border border-surface-200 p-1.5 text-neutral-500 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
