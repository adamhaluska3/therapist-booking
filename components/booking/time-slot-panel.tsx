"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { bookingContent } from "../../app/(booking)/booking/_content/booking";
import type { TimeSlot } from "@/lib/booking-types";
import { authClient } from "@/lib/auth-client";

const { slots: sc } = bookingContent;

export function TimeSlotPanel({
  slots,
  selectedTime,
  onSelectTime,
  locationType,
  onLocationTypeChange,
  note,
  onNoteChange,
  onConfirm,
  pending,
  error,
  disableConfirm = false,
}: {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
  locationType: "onsite" | "online";
  onLocationTypeChange: (v: "onsite" | "online") => void;
  note: string;
  onNoteChange: (v: string) => void;
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map(({ time, available }: TimeSlot) => (
              <button
                key={time}
                disabled={!available}
                onClick={() => available && onSelectTime(time)}
                className={cn(
                  "rounded-xl px-2 py-3 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
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

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Forma stretnutia</label>
        <div className="flex gap-2">
          {(["onsite", "online"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onLocationTypeChange(type)}
              className={cn(
                "flex-1 rounded-xl py-3 text-sm font-medium transition-colors",
                locationType === type
                  ? "bg-brand-800 text-white"
                  : "bg-white text-brand-900 shadow-sm hover:bg-surface-50",
              )}
            >
              {type === "onsite" ? "Na mieste" : "Online"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-neutral-700">
          Správa pre terapeuta <span className="text-neutral-400 font-normal">(voliteľné)</span>
        </label>
        <Textarea
          placeholder="Napíšte krátku správu alebo dôvod návštevy..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          className="resize-none bg-white"
        />
      </div>

      <div className="flex gap-2 rounded-xl bg-brand-50 px-4 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <p className="text-xs leading-relaxed text-brand-700">{sc.note}</p>
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

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
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/booking",
              })
            }
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
