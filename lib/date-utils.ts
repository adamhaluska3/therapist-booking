import { format, isToday, isTomorrow, isThisWeek } from "date-fns"
import { sk } from "date-fns/locale"

export type MonthGroup = {
  label: string
  bookings: { start: Date }[]
}

export function groupByMonth<T extends { start: Date }>(items: T[]): { label: string; bookings: T[] }[] {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = format(item.start, "yyyy-MM")
    const arr = map.get(key) ?? []
    arr.push(item)
    map.set(key, arr)
  }
  return Array.from(map.entries()).map(([key, group]) => ({
    label: format(new Date(key + "-01"), "LLLL", { locale: sk }),
    bookings: group,
  }))
}

export function formatBookingDate(date: Date): string {
  return format(date, "d. MMMM yyyy", { locale: sk })
}

export type TimeGroup = "today" | "tomorrow" | "week" | "later"

export function formatTime(date: Date): string {
  return format(date, "HH:mm")
}

export function formatDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function formatMonthShort(date: Date): string {
  return format(date, "LLLL", { locale: sk }).toUpperCase()
}

export function buildDate(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  const [hh, mm] = timeStr.split(":").map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

export function getTimeGroup(date: Date): TimeGroup {
  if (isToday(date)) return "today"
  if (isTomorrow(date)) return "tomorrow"
  if (isThisWeek(date, { weekStartsOn: 1 })) return "week"
  return "later"
}
