"use client";

import { AlignJustify, Plus, User } from "lucide-react";

export type EventType = "therapy" | "empty" | "blocked";

export const BOOKING_TYPE_COLORS: Record<
  string,
  { bg: string; label: string }
> = {
  "bt-psychoterapia": { bg: "#427a5c", label: "Psychoterapia" },
  "bt-supervizia": { bg: "#5a6abf", label: "Supervízia" },
  "bt-seminare": { bg: "#d96c4f", label: "Semináre" },
  "bt-koucing": { bg: "#bf8a2e", label: "Koučing" },
};

export const DEFAULT_THERAPY_COLOR = "#427a5c";

export interface TherapistEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  source: "slot" | "booking";
  slotId?: string;
  bookingId?: string;
  isDraggable?: boolean;
  clientName?: string;
  bookingTypeId?: string | null;
}

interface CalendarEventCardProps {
  event: TherapistEvent;
  compact?: boolean;
}

export function CalendarEventCard({ event, compact }: CalendarEventCardProps) {
  if (compact) {
    if (event.type === "empty") {
      return (
        <div className="h-full w-full flex items-center justify-center text-brand-500">
          <Plus className="h-3 w-3" />
        </div>
      );
    }
    if (event.type === "therapy") {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <User className="h-3 w-3 text-white" />
        </div>
      );
    }
    if (event.type === "blocked") {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <AlignJustify className="h-3 w-3 text-gray-400" />
        </div>
      );
    }
    return null;
  }

  if (event.type === "empty") {
    return (
      <div className="h-full w-full flex items-center justify-center gap-1 text-brand-500 overflow-hidden px-1">
        <Plus className="h-3 w-3 shrink-0" />
        <span className="text-[10px] font-semibold tracking-widest truncate">
          Dostupný čas
        </span>
      </div>
    );
  }

  if (event.type === "therapy") {
    const durationMin = (event.end.getTime() - event.start.getTime()) / 60000;
    const typeInfo = event.bookingTypeId
      ? BOOKING_TYPE_COLORS[event.bookingTypeId]
      : null;
    return (
      <div className="h-full flex flex-col justify-center p-2 overflow-hidden">
        {durationMin > 30 && (
          <div className="text-[8px] font-bold uppercase tracking-widest text-white/60 truncate">
            {typeInfo?.label ?? "Terapia"}
          </div>
        )}
        <div className="flex items-center gap-1 overflow-hidden">
          <User className="h-3 w-3 text-white/70 shrink-0" />
          <span className="text-xs font-semibold text-white leading-snug truncate">
            {event.clientName ?? event.title}
          </span>
        </div>
      </div>
    );
  }

  if (event.type === "blocked") {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <AlignJustify className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return null;
}
