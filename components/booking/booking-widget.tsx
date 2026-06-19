"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { BookingCalendar } from "./booking-calendar";
import { TimeSlotPanel } from "./time-slot-panel";
import {
  toDateKey,
  type SlotsByDate,
  type TimeSlot,
} from "@/lib/booking-types";
import { ADDRESS_SHORT } from "@/lib/constants";
import { createClientBookingAction } from "@/server/booking/actions";
import { authClient } from "@/lib/auth-client";

const bookingSchema = z.object({
  selectedDate: z.date(),
  selectedTime: z.string().min(1),
  locationType: z.enum(["onsite", "online"]),
  note: z.string(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

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
  bookingTypeId,
  leftHeader,
}: {
  slots: SlotsByDate;
  bookingTypeId: string | null;
  leftHeader?: React.ReactNode;
}) {
  const today = new Date();
  const [confirmed, setConfirmed] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      selectedDate: firstAvailableDate(slots),
      selectedTime: "",
      locationType: "onsite",
      note: "",
    },
  });

  const selectedDate = watch("selectedDate");
  const selectedTime = watch("selectedTime");
  const locationType = watch("locationType");
  const note = watch("note");

  const { data: session } = authClient.useSession();
  const user = session?.user;

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

  const handleSelectDate = (d: Date) => {
    setValue("selectedDate", d);
    setValue("selectedTime", "");
    clearErrors("root");
  };

  const onSubmit = handleSubmit(async (data) => {
    const result = await createClientBookingAction({
      dateKey: toDateKey(data.selectedDate),
      time: data.selectedTime,
      userId: user?.id ?? null,
      note: data.note,
      bookingTypeId,
      locationType: data.locationType,
    });
    if (result.ok) {
      setConfirmed(true);
    } else {
      setError("root", {
        message: result.error ?? "Nepodarilo sa vytvoriť rezerváciu.",
      });
    }
  });

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
        {locationType === "onsite" && (
          <div className="mb-6 flex items-center justify-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <p className="text-sm text-brand-700">
              Adresa stretnutia:{" "}
              <span className="font-semibold">{ADDRESS_SHORT}</span>
            </p>
          </div>
        )}
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
        selectedTime={selectedTime || null}
        onSelectTime={(t) => {
          setValue("selectedTime", t);
          clearErrors("root");
        }}
        locationType={locationType}
        onLocationTypeChange={(v) => setValue("locationType", v)}
        note={note}
        onNoteChange={(v) => setValue("note", v)}
        onConfirm={() => onSubmit()}
        pending={isSubmitting}
        error={errors.root?.message ?? null}
        disableConfirm={!user}
      />
    </div>
  );
}
