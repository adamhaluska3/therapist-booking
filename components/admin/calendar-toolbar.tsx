"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { sk } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface CalendarToolbarProps {
  date: Date
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void
  view: "week" | "month"
  onViewChange: (view: "week" | "month") => void
}

export function CalendarToolbar({ date, onNavigate, view, onViewChange }: CalendarToolbarProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  const startDay = format(weekStart, "d")
  const endDay = format(weekEnd, "d")
  const monthName = format(weekEnd, "MMMM", { locale: sk })
  const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Definujte svoje voľné hodiny
          </h2>
          <div className="text-sm text-gray-400 mt-0.5">
            {startDay}. – {endDay}. {monthCapitalized}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Week navigation */}
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

          {/* View toggle */}
          <div className="flex items-center bg-surface-100 rounded-lg p-0.5 border border-surface-200">
            <button
              onClick={() => onViewChange("week")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                view === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Týždeň
            </button>
            <button
              onClick={() => onViewChange("month")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                view === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Mesiac
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
