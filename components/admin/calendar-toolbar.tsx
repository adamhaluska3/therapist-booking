"use client"

import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { sk } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type CalendarView = "week" | "day"

interface CalendarToolbarProps {
  date: Date
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onNewEvent: () => void
}

export function CalendarToolbar({ date, onNavigate, view, onViewChange, onNewEvent }: CalendarToolbarProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(date,   { weekStartsOn: 1 })

  let dateLabel: string
  if (view === "day") {
    dateLabel = format(date, "d. MMMM yyyy", { locale: sk })
    dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
  } else {
    const startDay = format(weekStart, "d")
    const endDay   = format(weekEnd,   "d")
    const month    = format(weekEnd, "MMMM", { locale: sk })
    dateLabel = `${startDay}. – ${endDay}. ${month.charAt(0).toUpperCase() + month.slice(1)}`
  }

  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="hidden sm:block text-xl font-semibold text-gray-900">
            Definujte svoje voľné hodiny
          </h2>
          <div className="text-sm font-medium text-gray-700 sm:text-gray-400 sm:font-normal sm:mt-0.5">{dateLabel}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewEvent}
            className="hidden sm:flex h-9 w-9 rounded-full bg-brand-600 text-white shadow-md items-center justify-center hover:bg-brand-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onNavigate("PREV")}
              className="p-1.5 rounded-md hover:bg-surface-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("TODAY")}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-surface-100 transition-colors"
            >
              Dnes
            </button>
            <button
              onClick={() => onNavigate("NEXT")}
              className="p-1.5 rounded-md hover:bg-surface-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center bg-surface-100 rounded-lg p-0.5 border border-surface-200">
            {(["day", "week"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  view === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {v === "day" ? "Deň" : "Týždeň"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
