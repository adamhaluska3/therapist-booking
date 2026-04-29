"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { bookingContent } from "../../app/(booking)/booking/_content/booking";
import { toDateKey } from "@/lib/booking-types";

const { calendar } = bookingContent;

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPast(date: Date, today: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  return d < t;
}

function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDow = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export function BookingCalendar({
  today,
  selected,
  onSelect,
  availableDates,
}: {
  today: Date;
  selected: Date | null;
  onSelect: (d: Date) => void;
  availableDates: Set<string>;
}) {
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const grid = buildCalendarGrid(viewYear, viewMonth);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-serif text-lg font-semibold italic text-brand-700">
          {calendar.label}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            aria-label="Predchádzajúci mesiac"
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-100"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          </button>
          <span className="min-w-32 text-center text-sm font-semibold text-brand-900">
            {calendar.months[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            aria-label="Nasledujúci mesiac"
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-100"
          >
            <ChevronRight className="h-4 w-4 text-neutral-600" />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {calendar.weekDays.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((date, i) => {
          if (!date) return <div key={i} />;

          const past = isPast(date, today);
          const available = !past && availableDates.has(toDateKey(date));
          const disabled = past;
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isToday = isSameDay(date, today);

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5",
                disabled ? "cursor-default" : "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                  isSelected
                    ? "bg-brand-700 font-semibold text-white"
                    : disabled
                      ? "text-neutral-300"
                      : isToday
                        ? "font-semibold text-brand-700 hover:bg-surface-100"
                        : available
                          ? "text-neutral-700 hover:bg-surface-100"
                          : "text-neutral-400 hover:bg-surface-100",
                )}
              >
                {date.getDate()}
                {available && (
                  <span className={cn("absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full", isSelected ? "bg-white/70" : "bg-brand-500")} />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
