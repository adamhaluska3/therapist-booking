import type { AvailabilitySlot, Booking, BookingWithUser } from "@/db/schema";
import type { TherapistEvent } from "@/components/admin/calendar-event-card";

function bookingToEvent(b: BookingWithUser): TherapistEvent {
  const displayName = b.user?.nickname ?? b.user?.name ?? undefined;
  return {
    id: `booking_${b.id}`,
    title: displayName ?? "Terapia",
    start: b.start,
    end: b.end,
    type: "therapy",
    source: "booking",
    bookingId: b.id,
    clientName: displayName,
    bookingTypeId: b.bookingTypeId ?? null,
    status: b.status,
  };
}

export function buildDisplayEvents(
  slots: AvailabilitySlot[],
  bookings: BookingWithUser[],
): TherapistEvent[] {
  const events: TherapistEvent[] = [];
  const handledBookingIds = new Set<string>();

  for (const slot of slots) {
    const slotStart = slot.start.getTime();
    const slotEnd = slot.end.getTime();

    const within = bookings
      .filter((b) => b.start.getTime() < slotEnd && b.end.getTime() > slotStart)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    within.forEach((b) => handledBookingIds.add(b.id));

    if (within.length === 0) {
      events.push({
        id: `slot_${slot.id}`,
        title: slot.label ?? "Dostupný čas",
        start: slot.start,
        end: slot.end,
        type: "empty",
        source: "slot",
        slotId: slot.id,
        isDraggable: true,
      });
      continue;
    }

    let cursor = slot.start;

    for (const b of within) {
      const bStart = new Date(Math.max(b.start.getTime(), slotStart));
      const bEnd = new Date(Math.min(b.end.getTime(), slotEnd));

      if (cursor < bStart) {
        events.push({
          id: `slot_${slot.id}_empty_${cursor.getTime()}`,
          title: slot.label ?? "Dostupný čas",
          start: cursor,
          end: bStart,
          type: "empty",
          source: "slot",
          slotId: slot.id,
          isDraggable: false,
        });
      }

      events.push(bookingToEvent({ ...b, start: bStart, end: bEnd }));
      cursor = bEnd;
    }

    if (cursor < slot.end) {
      events.push({
        id: `slot_${slot.id}_empty_${cursor.getTime()}`,
        title: slot.label ?? "Dostupný čas",
        start: cursor,
        end: slot.end,
        type: "empty",
        source: "slot",
        slotId: slot.id,
        isDraggable: false,
      });
    }
  }

  for (const b of bookings) {
    if (!handledBookingIds.has(b.id)) {
      events.push(bookingToEvent(b));
    }
  }

  return events;
}

export function applySlotMove(
  slots: AvailabilitySlot[],
  slotId: string,
  newStart: Date,
  newEnd: Date,
): AvailabilitySlot[] {
  return slots.map((s) =>
    s.id === slotId ? { ...s, start: newStart, end: newEnd } : s,
  );
}

export function applyBookingMove<T extends Booking>(
  bookings: T[],
  bookingId: string,
  newStart: Date,
  newEnd: Date,
): T[] {
  return bookings.map((b) =>
    b.id === bookingId ? { ...b, start: newStart, end: newEnd } : b,
  );
}

export function bookingOverlapsOthers(
  bookings: Booking[],
  booking: { id: string; start: Date; end: Date },
): boolean {
  return bookings.some(
    (b) =>
      b.id !== booking.id &&
      b.start.getTime() < booking.end.getTime() &&
      b.end.getTime() > booking.start.getTime(),
  );
}

export function trimSlotsAroundBooking(
  slots: AvailabilitySlot[],
  booking: { start: Date; end: Date },
): {
  result: AvailabilitySlot[];
  upserted: AvailabilitySlot[];
  deleted: string[];
} {
  const bStart = booking.start.getTime();
  const bEnd = booking.end.getTime();

  const result: AvailabilitySlot[] = [];
  const upserted: AvailabilitySlot[] = [];
  const deleted: string[] = [];

  for (const slot of slots) {
    const sStart = slot.start.getTime();
    const sEnd = slot.end.getTime();

    if (bEnd <= sStart || bStart >= sEnd) {
      result.push(slot);
      continue;
    }

    if (bStart <= sStart && bEnd >= sEnd) {
      deleted.push(slot.id);
      continue;
    }

    if (bStart <= sStart) {
      const trimmed = { ...slot, start: new Date(bEnd) };
      result.push(trimmed);
      upserted.push(trimmed);
      continue;
    }

    if (bEnd >= sEnd) {
      const trimmed = { ...slot, end: new Date(bStart) };
      result.push(trimmed);
      upserted.push(trimmed);
      continue;
    }

    const left: AvailabilitySlot = { ...slot, end: new Date(bStart) };
    const right: AvailabilitySlot = {
      id: crypto.randomUUID(),
      start: new Date(bEnd),
      end: slot.end,
      label: slot.label,
    };
    result.push(left, right);
    upserted.push(left, right);
  }

  return { result, upserted, deleted };
}

export function mergeAdjacentSlots(slots: AvailabilitySlot[]): {
  merged: AvailabilitySlot[];
  deleted: string[];
  dirty: string[];
} {
  if (slots.length <= 1) return { merged: slots, deleted: [], dirty: [] };

  const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());
  const result: AvailabilitySlot[] = [];
  const deleted: string[] = [];
  const dirty: string[] = [];

  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.start.getTime() <= current.end.getTime()) {
      const newEnd = new Date(Math.max(current.end.getTime(), next.end.getTime()));
      if (newEnd.getTime() !== current.end.getTime()) {
        current = { ...current, end: newEnd };
        dirty.push(current.id);
      }
      deleted.push(next.id);
    } else {
      result.push(current);
      current = { ...next };
    }
  }
  result.push(current);

  return { merged: result, deleted, dirty };
}
