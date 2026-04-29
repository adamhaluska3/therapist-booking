"use client";

import { useState, useCallback, useMemo } from "react";
import { BookingCalendar } from "./booking-calendar";
import { TimeSlotPanel } from "./time-slot-panel";
import { createClientBooking } from "@/server/actions/index";
import type { SlotsByDate, TimeSlot } from "@/lib/booking-types";

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function firstAvailableDate(slots: SlotsByDate): Date {
  const todayKey = toDateKey(new Date());
  const first = Object.keys(slots)
    .filter((k) => k >= todayKey && slots[k].some((s) => s.available))
    .sort()[0];
  if (first) {
    const [y, m, d] = first.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date();
}

export function BookingWidget({ slots }: { slots: SlotsByDate }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => firstAvailableDate(slots));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = useMemo(
    () =>
      new Set(
        Object.entries(slots)
          .filter(([, s]) => s.some((sl) => sl.available))
          .map(([key]) => key),
      ),
    [slots],
  );

  const dateSlots: TimeSlot[] = selectedDate ? (slots[toDateKey(selectedDate)] ?? []) : [];

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    setSelectedTime(null);
    setError(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    setPending(true);
    setError(null);
    const result = await createClientBooking(toDateKey(selectedDate), selectedTime);
    setPending(false);
    if (result.ok) {
      setConfirmed(true);
    } else {
      setError(result.error ?? "Nepodarilo sa vytvoriť rezerváciu.");
    }
  }, [selectedDate, selectedTime]);

  if (confirmed) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="mb-2 font-serif text-2xl font-semibold italic text-brand-700">
          Rezervácia potvrdená
        </p>
        <p className="text-sm text-neutral-500">
          Tešíme sa na vás. Potvrdenie vám zašleme e-mailom.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
      <BookingCalendar
        today={today}
        selected={selectedDate}
        onSelect={handleSelectDate}
        availableDates={availableDates}
      />
      <TimeSlotPanel
        slots={dateSlots}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        onConfirm={handleConfirm}
        pending={pending}
        error={error}
      />
    </div>
  );
}
