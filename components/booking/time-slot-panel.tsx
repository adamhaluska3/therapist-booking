"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  bookingContent,
  getSlotsForDate,
  type BookingSlot,
} from "../../app/(booking)/booking/_content/booking";

const { slots: sc } = bookingContent;

export function TimeSlotPanel({
  selected,
  selectedTime,
  onSelectTime,
  onConfirm,
}: {
  selected: Date | null;
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
  onConfirm: () => void;
}) {
  const slots = selected ? getSlotsForDate(selected) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Slots card */}
      <div className="rounded-2xl bg-surface-100 p-6">
        <p className="mb-4 font-serif text-base font-semibold italic text-brand-700">
          {sc.label}
        </p>

        {!selected && (
          <p className="text-sm text-neutral-400">Najprv vyberte dátum.</p>
        )}

        {selected && slots.length === 0 && (
          <p className="text-sm text-neutral-400">
            V tento deň nie sú dostupné termíny.
          </p>
        )}

        {slots.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {slots.map(({ time, occupied }: BookingSlot) => (
              <button
                key={time}
                disabled={occupied}
                onClick={() => !occupied && onSelectTime(time)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  occupied
                    ? "cursor-default bg-surface-200 text-neutral-400 italic"
                    : selectedTime === time
                      ? "bg-brand-800 text-white"
                      : "bg-white text-brand-900 shadow-sm hover:bg-surface-50",
                )}
              >
                {occupied ? `${time} (${sc.occupiedLabel})` : time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div className="flex gap-2 rounded-xl bg-brand-50 px-4 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <p className="text-xs leading-relaxed text-brand-700">{sc.note}</p>
      </div>

      {/* Confirm */}
      <Button
        disabled={!selected || !selectedTime}
        onClick={onConfirm}
        className="h-12 rounded-full bg-brand-800 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-40"
      >
        {sc.confirmCta}
      </Button>

      <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
        {sc.footer}
      </p>
    </div>
  );
}
