"use client"

import { AlignJustify, Plus } from "lucide-react"

export type EventType = "therapy" | "empty" | "blocked"

export interface TherapistEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: EventType
  source: "slot" | "booking"
  slotId?: string
  bookingId?: string
  isDraggable?: boolean
  clientName?: string
}

interface CalendarEventCardProps {
  event: TherapistEvent
}

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  if (event.type === "empty") {
    return (
      <div className="h-full w-full flex items-center justify-center gap-1 text-brand-500">
        <Plus className="h-3 w-3 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest">
          Dostupný čas
        </span>
      </div>
    )
  }

  if (event.type === "therapy") {
    return (
      <div className="h-full flex flex-col p-2">
        <div className="text-[9px] font-bold uppercase tracking-widest text-brand-200 mb-0.5">
          Terapia
        </div>
        <div className="text-sm font-semibold text-white leading-snug">
          {event.clientName ?? event.title}
        </div>
      </div>
    )
  }

  if (event.type === "blocked") {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <AlignJustify className="h-4 w-4 text-gray-400" />
      </div>
    )
  }

  return null
}
