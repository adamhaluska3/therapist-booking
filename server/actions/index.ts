"use server";
import { and, eq, gt, gte, inArray, lt, lte, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlot, booking } from "@/db/schema";
import { user } from "@/db/auth-schema";
import type { UserOption } from "@/server/queries/users";
import type { BookingWithUser, AvailabilitySlot } from "@/db/schema";

export async function fetchCalendarData(
  from: Date,
  to: Date,
): Promise<{ slots: AvailabilitySlot[]; bookings: BookingWithUser[] }> {
  const [slots, bookingRows] = await Promise.all([
    db
      .select()
      .from(availabilitySlot)
      .where(
        and(lte(availabilitySlot.start, to), gte(availabilitySlot.end, from)),
      ),
    db
      .select()
      .from(booking)
      .leftJoin(user, eq(booking.userId, user.id))
      .where(and(lte(booking.start, to), gte(booking.end, from))),
  ]);

  return {
    slots,
    bookings: bookingRows.map((row) => ({
      ...row.booking,
      user: row.user
        ? {
            id: row.user.id,
            name: row.user.name,
            nickname: row.user.nickname,
            email: row.user.email,
          }
        : null,
    })),
  };
}

export type SlotUpsert = {
  id: string;
  start: Date;
  end: Date;
  label?: string | null;
};

export async function saveAvailabilitySlots(
  upserted: SlotUpsert[],
  deletedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    if (deletedIds.length > 0) {
      await tx
        .delete(availabilitySlot)
        .where(inArray(availabilitySlot.id, deletedIds));
    }

    for (const slot of upserted) {
      await tx
        .insert(availabilitySlot)
        .values({
          id: slot.id,
          start: slot.start,
          end: slot.end,
          label: slot.label ?? null,
        })
        .onConflictDoUpdate({
          target: availabilitySlot.id,
          set: { start: slot.start, end: slot.end, label: slot.label ?? null },
        });
    }
  });
}

export type BookingUpsert = {
  id: string;
  start: Date;
  end: Date;
  status?: "pending" | "confirmed" | "cancelled" | "finished";
  price?: number | null;
  notes?: string | null;
  userId?: string | null;
  bookingTypeId?: string | null;
};

export async function saveBookings(
  upserted: BookingUpsert[],
  deletedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    if (deletedIds.length > 0) {
      await tx.delete(booking).where(inArray(booking.id, deletedIds));
    }

    for (const b of upserted) {
      await tx
        .insert(booking)
        .values({
          id: b.id,
          start: b.start,
          end: b.end,
          status: b.status ?? "confirmed",
          price: b.price ?? null,
          notes: b.notes ?? null,
          userId: b.userId ?? null,
          bookingTypeId: b.bookingTypeId ?? null,
        })
        .onConflictDoUpdate({
          target: booking.id,
          set: {
            start: b.start,
            end: b.end,
            status: b.status ?? "confirmed",
            notes: b.notes ?? null,
            userId: b.userId ?? null,
            bookingTypeId: b.bookingTypeId ?? null,
          },
        });
    }
  });
}

export async function deleteBookingById(id: string): Promise<void> {
  await db.delete(booking).where(eq(booking.id, id));
}

export async function updateBookingStatus(
  id: string,
  status: "cancelled" | "finished",
): Promise<void> {
  await db.update(booking).set({ status }).where(eq(booking.id, id));
}

export async function confirmBooking(id: string): Promise<void> {
  await db
    .update(booking)
    .set({ status: "confirmed" })
    .where(eq(booking.id, id));
}

export async function updateBookingTime(
  id: string,
  start: Date,
  end: Date,
): Promise<{ ok: boolean; error?: string }> {
  const conflicts = await db
    .select({ id: booking.id })
    .from(booking)
    .where(
      and(
        lt(booking.start, end),
        gt(booking.end, start),
        eq(booking.status, "confirmed"),
        ne(booking.id, id),
      ),
    );

  if (conflicts.length > 0) {
    return { ok: false, error: "V tomto čase už existuje potvrdené sedenie." };
  }

  await db.update(booking).set({ start, end }).where(eq(booking.id, id));
  return { ok: true };
}

export async function createClientBooking(
  dateKey: string,
  time: string,
  userId?: string,
): Promise<{ ok: boolean; error?: string }> {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const start = new Date(y, m - 1, d, hh, mm, 0, 0);
  const end = new Date(start.getTime() + 3_600_000);

  const conflicts = await db
    .select({ id: booking.id })
    .from(booking)
    .where(and(lt(booking.start, end), gt(booking.end, start)));

  if (conflicts.length > 0) {
    return { ok: false, error: "Tento termín je už obsadený." };
  }

  await db.insert(booking).values({
    start,
    end,
    status: "pending",
    userId: userId ?? null,
  });

  return { ok: true };
}

export async function updateUserNickname(
  userId: string,
  nickname: string,
): Promise<void> {
  await db
    .update(user)
    .set({ nickname: nickname || null })
    .where(eq(user.id, userId));
}

export async function createNonOAuthUser(
  name: string,
  email: string,
  phone?: string,
): Promise<{ ok: boolean; user?: UserOption; error?: string }> {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (!trimmedName || !trimmedEmail) {
    return { ok: false, error: "Meno a email sú povinné." };
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, trimmedEmail));

  if (existing.length > 0) {
    return { ok: false, error: "Používateľ s týmto emailom už existuje." };
  }

  const id = crypto.randomUUID();
  await db.insert(user).values({
    id,
    name: trimmedName,
    email: trimmedEmail,
    emailVerified: false,
    phone: phone?.trim() || null,
    role: "user",
  });

  return {
    ok: true,
    user: { id, name: trimmedName, nickname: null, email: trimmedEmail },
  };
}
