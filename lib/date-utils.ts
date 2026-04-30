import { format, isToday, isTomorrow } from "date-fns"
import { sk } from "date-fns/locale"

export type TimeGroup = "today" | "tomorrow" | "week"

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
  return "week"
}
