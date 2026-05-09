"use server";
import { db } from "@/lib/db";
import { BookingUpsert } from "./schema";
import { booking } from "@/db/schema";
import { eq, inArray, and, gt, lt, ne } from "drizzle-orm";
import { user } from "@/db/auth-schema";
import {
  sendBookingCancellationToClient,
  sendBookingConfirmationToClient,
  sendBookingNotificationToTherapist,
  sendBookingRescheduledToClient,
} from "@/lib/email";
import { getUserById } from "../user/queries";

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
          userId: b.userId ?? null,
          bookingTypeId: b.bookingTypeId ?? null,
        })
        .onConflictDoUpdate({
          target: booking.id,
          set: {
            start: b.start,
            end: b.end,
            status: b.status ?? "confirmed",
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

export async function deleteBookingWithNotification(id: string): Promise<void> {
  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1);

  const row = rows[0];

  await db.delete(booking).where(eq(booking.id, id));

  if (row?.user?.email) {
    const clientName = row.user.nickname ?? row.user.name;
    void sendBookingCancellationToClient({
      clientName,
      clientEmail: row.user.email,
      start: row.booking.start,
      end: row.booking.end,
    });
  }
}

export async function updateBookingStatus(
  id: string,
  status: "cancelled" | "finished",
): Promise<void> {
  if (status === "cancelled") {
    const rows = await db
      .select()
      .from(booking)
      .leftJoin(user, eq(booking.userId, user.id))
      .where(eq(booking.id, id))
      .limit(1);

    const row = rows[0];
    if (row?.user?.email) {
      const clientName = row.user.nickname ?? row.user.name;
      void sendBookingCancellationToClient({
        clientName,
        clientEmail: row.user.email,
        start: row.booking.start,
        end: row.booking.end,
      });
    }
  }

  await db.update(booking).set({ status }).where(eq(booking.id, id));
}

export async function confirmBooking(id: string): Promise<void> {
  await db
    .update(booking)
    .set({ status: "confirmed" })
    .where(eq(booking.id, id));

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return;

  const clientEmail = row.user?.email;
  if (!clientEmail) return;

  const clientName = row.user?.nickname ?? row.user?.name ?? "Klient";

  await sendBookingConfirmationToClient({
    bookingId: id,
    start: row.booking.start,
    end: row.booking.end,
    clientName,
    clientEmail,
  }).catch(() => undefined);
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

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1);

  const row = rows[0];
  const oldStart = row?.booking.start;

  await db.update(booking).set({ start, end }).where(eq(booking.id, id));

  if (row?.user?.email && oldStart) {
    const clientName = row.user.nickname ?? row.user.name;
    void sendBookingRescheduledToClient({
      clientName,
      clientEmail: row.user.email,
      bookingId: id,
      oldStart,
      newStart: start,
      newEnd: end,
    });
  }

  return { ok: true };
}

export async function updateBookingFromDialog(
  id: string,
  updates: {
    start: Date;
    end: Date;
    userId: string | null;
    bookingTypeId: string | null;
    note: string | null;
    locationType: "onsite" | "online";
  },
  previousStart: Date,
): Promise<{ ok: boolean; error?: string }> {
  const timeChanged = updates.start.getTime() !== previousStart.getTime();

  if (timeChanged) {
    const conflicts = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          lt(booking.start, updates.end),
          gt(booking.end, updates.start),
          eq(booking.status, "confirmed"),
          ne(booking.id, id),
        ),
      );
    if (conflicts.length > 0) {
      return {
        ok: false,
        error: "V tomto čase už existuje potvrdené sedenie.",
      };
    }
  }

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(eq(booking.id, id))
    .limit(1);
  const row = rows[0];

  await db
    .update(booking)
    .set({
      start: updates.start,
      end: updates.end,
      userId: updates.userId,
      bookingTypeId: updates.bookingTypeId,
      note: updates.note,
      locationType: updates.locationType,
    })
    .where(eq(booking.id, id));

  if (timeChanged && row?.user?.email) {
    const clientName = row.user.nickname ?? row.user.name;
    void sendBookingRescheduledToClient({
      clientName,
      clientEmail: row.user.email,
      bookingId: id,
      oldStart: previousStart,
      newStart: updates.start,
      newEnd: updates.end,
    });
  }

  return { ok: true };
}

export async function createClientBooking(
  dateKey: string,
  time: string,
  userId?: string,
  note?: string | null,
  locationType: "onsite" | "online" = "onsite",
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

  const [inserted] = await db
    .insert(booking)
    .values({
      start,
      end,
      status: "pending",
      userId: userId ?? null,
      note: note?.trim() || null,
      locationType,
    })
    .returning({ id: booking.id });

  const clientUser = userId ? await getUserById(userId) : null;
  const clientName = clientUser?.nickname ?? clientUser?.name ?? "Klient";
  const clientEmail = clientUser?.email;

  await sendBookingNotificationToTherapist({
    start,
    end,
    clientName,
    clientEmail,
  }).catch(() => undefined);

  return { ok: true };
}

export async function createAdminBooking(data: {
  id: string;
  start: Date;
  end: Date;
  status: "pending" | "confirmed" | "cancelled" | "finished";
  userId: string | null;
  bookingTypeId: string | null;
  price: number | null;
  note: string | null;
  locationType: "onsite" | "online";
}): Promise<void> {
  await db.insert(booking).values({
    id: data.id,
    start: data.start,
    end: data.end,
    status: data.status,
    userId: data.userId,
    bookingTypeId: data.bookingTypeId,
    price: data.price,
    note: data.note,
    locationType: data.locationType,
  });

  if (data.userId) {
    const clientUser = await getUserById(data.userId);
    if (clientUser?.email) {
      void sendBookingConfirmationToClient({
        bookingId: data.id,
        start: data.start,
        end: data.end,
        clientName: clientUser.nickname ?? clientUser.name ?? "Klient",
        clientEmail: clientUser.email,
      });
    }
  }
}
