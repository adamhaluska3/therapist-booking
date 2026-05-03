"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookingContent } from "../../app/(booking)/booking/_content/booking";
import type { TimeSlot } from "@/lib/booking-types";
import { authClient } from "@/lib/auth-client";

const { slots: sc } = bookingContent;

export function TimeSlotPanel({
  slots,
  selectedTime,
  onSelectTime,
  onConfirm,
  pending,
  error,
  disableConfirm = false,
}: {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
  disableConfirm?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface-100 p-6">
        <p className="mb-4 font-serif text-base font-semibold italic text-brand-700">
          {sc.label}
        </p>

        {slots.length === 0 && (
          <p className="text-sm text-neutral-400">
            V tento deň nie sú dostupné termíny.
          </p>
        )}

        {slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {slots.map(({ time, available }: TimeSlot) => (
              <button
                key={time}
                disabled={!available}
                onClick={() => available && onSelectTime(time)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  !available
                    ? "cursor-default bg-surface-200 text-neutral-400 italic"
                    : selectedTime === time
                      ? "bg-brand-800 text-white"
                      : "bg-white text-brand-900 shadow-sm hover:bg-surface-50",
                )}
              >
                {!available ? `${time} (${sc.occupiedLabel})` : time}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 rounded-xl bg-brand-50 px-4 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <p className="text-xs leading-relaxed text-brand-700">{sc.note}</p>
      </div>

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}

      <Button
        disabled={!selectedTime || pending || disableConfirm}
        onClick={onConfirm}
        className="h-12 rounded-full bg-brand-800 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-40"
      >
        {pending ? "Rezervujem…" : sc.confirmCta}
      </Button>

      {disableConfirm && (
        <p className="text-center text-sm text-neutral-500">
          Pre rezerváciu sa musíte{" "}
          <button
            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/booking" })}
            className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            prihlásiť
          </button>
          .
        </p>
      )}

      <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
        {sc.footer}
      </p>
    </div>
  );
}
