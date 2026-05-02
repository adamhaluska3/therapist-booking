"use client"

import { useState } from "react"
import { Search, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateInput, getTimeGroup, type TimeGroup } from "@/lib/date-utils"
import type { BookingWithUser } from "@/db/schema"
import { SessionCard } from "@/components/admin/session-card"

type FilterKey = "all" | "today" | "week"

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Všetky" },
  { key: "today", label: "Dnes" },
  { key: "week", label: "Tento týždeň" },
]

const GROUP_LABELS: Record<TimeGroup, string> = {
  today: "Dnes",
  tomorrow: "Zajtra",
  week: "Tento týždeň",
}

export function DashboardView({ bookings }: { bookings: BookingWithUser[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  const lowerSearch = search.toLowerCase()

  const filtered = bookings.filter((b) => {
    const matchesSearch = (b.user?.nickname ?? b.user?.name ?? "").toLowerCase().includes(lowerSearch)
    if (selectedDate) return matchesSearch && formatDateInput(b.start) === selectedDate
    const matchesTime =
      activeFilter === "all" ||
      activeFilter === "week" ||
      getTimeGroup(b.start) === activeFilter
    return matchesTime && matchesSearch
  })

  const buckets: Record<TimeGroup, BookingWithUser[]> = { today: [], tomorrow: [], week: [] }
  for (const b of filtered) buckets[getTimeGroup(b.start)].push(b)
  const groups = (["today", "tomorrow", "week"] as TimeGroup[])
    .filter((g) => buckets[g].length > 0)
    .map((g) => ({ group: g, bookings: buckets[g] }))

  function handleDateChange(value: string) {
    setSelectedDate(value)
    if (value) setActiveFilter("all")
  }

  function handleFilterClick(key: FilterKey) {
    setActiveFilter(key)
    setSelectedDate("")
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1">
          Administratíva
        </p>
        <h1 className="font-serif text-4xl font-bold text-neutral-800 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
          Potvrdené sedenia
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hľadať klienta..."
                className="w-full rounded-full border border-surface-200 bg-white pl-8 pr-4 py-1.5 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className={cn(
                  "rounded-full border bg-white pl-8 pr-4 py-1.5 text-sm outline-none transition-colors",
                  selectedDate ? "border-brand-400 text-neutral-700" : "border-surface-200 text-neutral-400"
                )}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterClick(f.key)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeFilter === f.key && !selectedDate
                    ? "bg-brand-600 text-white"
                    : "bg-white border border-surface-200 text-neutral-600 hover:bg-surface-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {groups.length === 0 && (
          <p className="text-sm text-neutral-400 py-12 text-center">
            Žiadne sedenia pre zvolený filter.
          </p>
        )}
        {groups.map(({ group, bookings: items }, groupIdx) => (
          <div key={group}>
            {(groupIdx > 0 || group !== "today") && (
              <p className="text-base font-semibold text-neutral-700 mb-3">
                {GROUP_LABELS[group]}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {items.map((booking) => (
                <SessionCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
