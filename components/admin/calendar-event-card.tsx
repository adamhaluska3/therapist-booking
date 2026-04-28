"use client"

import { Lock, Trash2, AlignJustify, Plus } from "lucide-react"

export type EventType = "individual" | "group" | "break" | "preconsultation" | "empty" | "blocked"

export interface TherapistEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: EventType
  clientName?: string
  subtitle?: string
  participants?: { name: string; initials: string }[]
}

interface CalendarEventCardProps {
  event: TherapistEvent
  onDelete?: (id: string) => void
}

export function CalendarEventCard({ event, onDelete }: CalendarEventCardProps) {
  if (event.type === "empty") {
    return (
      <div className="h-full w-full flex items-center justify-center gap-1 text-brand-500">
        <Plus className="h-3 w-3 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest">
          Vytvoriť slot
        </span>
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

  if (event.type === "individual") {
    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-brand-200 mb-0.5">
            Individuálna
          </div>
          <div className="text-sm font-semibold text-white leading-snug">
            {event.clientName ?? event.title}
          </div>
        </div>
        <div className="flex justify-end">
          <Lock className="h-3 w-3 text-brand-300" />
        </div>
      </div>
    )
  }

  if (event.type === "preconsultation") {
    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="text-sm font-semibold text-white leading-snug">
          {event.clientName ?? event.title}
        </div>
        {event.subtitle && (
          <div className="text-[10px] text-brand-100">{event.subtitle}</div>
        )}
      </div>
    )
  }

  if (event.type === "group") {
    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-brand-100 mb-0.5">
            Skupinová terapia
          </div>
          <div className="text-sm font-semibold text-white leading-snug">
            {event.title}
          </div>
        </div>
        {event.participants && event.participants.length > 0 && (
          <div className="flex gap-0.5">
            {event.participants.slice(0, 5).map((p, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-full bg-brand-700 border border-brand-600 flex items-center justify-center text-[8px] font-semibold text-brand-100"
              >
                {p.initials}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (event.type === "break") {
    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="text-sm font-medium text-white leading-snug">
          {event.title}
        </div>
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(event.id)
            }}
          >
            <Trash2 className="h-3 w-3 text-brand-200 hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    )
  }

  return null
}
