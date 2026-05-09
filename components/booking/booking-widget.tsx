"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { BookingCalendar } from "./booking-calendar";
import { TimeSlotPanel } from "./time-slot-panel";
import { createClientBooking } from "@/server/booking/mutations";
import {
  toDateKey,
  type SlotsByDate,
  type TimeSlot,
} from "@/lib/booking-types";
import { useUser } from "@/lib/user-context";

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

export function BookingWidget({
  slots,
  leftHeader,
}: {
  slots: SlotsByDate;
  leftHeader?: React.ReactNode;
}) {
  const today = new Date();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    firstAvailableDate(slots),
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [locationType, setLocationType] = useState<"onsite" | "online">(
    "onsite",
  );
  const [note, setNote] = useState("");
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

  const dateSlots: TimeSlot[] = selectedDate
    ? (slots[toDateKey(selectedDate)] ?? [])
    : [];

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    setSelectedTime(null);
    setError(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    setPending(true);
    setError(null);
    const result = await createClientBooking(
      toDateKey(selectedDate),
      selectedTime,
      user?.id,
      note,
      locationType,
    );
    setPending(false);
    if (result.ok) {
      setConfirmed(true);
    } else {
      setError(result.error ?? "Nepodarilo sa vytvoriť rezerváciu.");
    }
  }, [selectedDate, selectedTime, user?.id]);

  if (confirmed) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
          <svg
            className="h-6 w-6 text-brand-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mb-2 font-serif text-2xl font-semibold italic text-brand-700">
          Žiadosť odoslaná
        </p>
        <p className="mb-4 text-sm leading-relaxed text-neutral-500">
          Vaša žiadosť o sedenie bola úspešne prijatá. Terapeut ju musí ešte
          schváliť — o schválení budete informovaní e-mailom.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-brand-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors"
        >
          Späť na hlavnú stránku
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
      <div>
        {leftHeader}
        <BookingCalendar
          today={today}
          selected={selectedDate}
          onSelect={handleSelectDate}
          availableDates={availableDates}
        />
      </div>
      <TimeSlotPanel
        slots={dateSlots}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        locationType={locationType}
        onLocationTypeChange={setLocationType}
        note={note}
        onNoteChange={setNote}
        onConfirm={handleConfirm}
        pending={pending}
        error={error}
        disableConfirm={!user}
      />
    </div>
  );
}
