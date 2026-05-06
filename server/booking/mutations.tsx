"use server";
import { db } from "@/lib/db";
import { BookingUpsert } from "./schema";
import { booking, bookingType } from "@/db/schema";
import { eq, inArray, and, gt, lt, ne } from "drizzle-orm";
import { account, user } from "@/db/auth-schema";
import {
  sendBookingCancellationToClient,
  sendBookingConfirmationToClient,
  sendBookingNotificationToTherapist,
  sendBookingRescheduledToClient,
} from "@/lib/email";
import { getUserById } from "../user/queries";
import { requireAdmin, requireAuth, requireUser } from "../auth";
import { fetchPriceForBookingType } from "../booking-type/queries";
import { DEFAULT_BOOKABLE_TYPE_NAME } from "@/lib/constants";
import { createMeetLink } from "../utils/meet";
import { generateVS } from "../utils/payment";

export async function saveBookings(
  upserted: BookingUpsert[],
  deletedIds: string[],
): Promise<void> {
  await requireAdmin();
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
  await requireAdmin();
  await db.delete(booking).where(eq(booking.id, id));
}

export async function deleteBookingWithNotification(id: string): Promise<void> {
  await requireAdmin();
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
  await requireAdmin();
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
  const authUser = await requireAdmin();
  const googleAccount = await db.query.account.findFirst({
    where: eq(account.userId, authUser.id),
  });

  const foundBooking = await db.query.booking.findFirst({ where: eq(booking.id, id) })
  if (!foundBooking) {
    return
  }

  const clientUser = foundBooking.userId ? await getUserById(foundBooking.userId) : null;
  const meet = await createMeetLink(foundBooking.start.toISOString(), foundBooking.end.toISOString(), googleAccount?.refreshToken ?? "", clientUser?.email ?? undefined);

  await db
    .update(booking)
    .set({ status: "confirmed", meetLink: meet?.meetLink })
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
  await requireAdmin();
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

  await requireAdmin();
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
  bookingTypeId?: string | null,
  locationType: "onsite" | "online" = "onsite",
): Promise<{ ok: boolean; error?: string }> {
  await requireUser();
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

  const priceSnapshot = bookingTypeId ? await fetchPriceForBookingType(bookingTypeId) : null

  const [inserted] = await db
    .insert(booking)
    .values({
      start,
      end,
      status: "pending",
      userId: userId ?? null,
      bookingTypeId: await db
        .select({ id: bookingType.id })
        .from(bookingType)
        .where(eq(bookingType.name, DEFAULT_BOOKABLE_TYPE_NAME))
        .limit(1)
        .then((rows) => rows[0]?.id ?? null),
      note: note?.trim() || null,
      locationType,
      variableSymbol: generateVS(),
      price: priceSnapshot,
    })
    .returning({ id: booking.id });

  const clientUserQuery = !userId
    ? null
    : await db.select().from(user).where(eq(user.id, userId));
  const clientUser = clientUserQuery?.[0];
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
  const authUser = await requireAdmin();
  const priceSnapshot = data.price ?? (data.bookingTypeId ? await fetchPriceForBookingType(data.bookingTypeId) : null)

  const googleAccount = await db.query.account.findFirst({
      where: eq(account.userId, authUser.id),
    });
  
  const clientUser = data.userId ? await getUserById(data.userId) : null;
  const meet = await createMeetLink(data.start.toISOString(), data.end.toISOString(), googleAccount?.refreshToken ?? "", clientUser?.email ?? undefined);
  await db.insert(booking).values({
    id: data.id,
    start: data.start,
    end: data.end,
    status: data.status,
    userId: data.userId,
    bookingTypeId: data.bookingTypeId,
    price: priceSnapshot,
    meetLink: (data.status === "confirmed" ? meet?.meetLink : null),
    variableSymbol: generateVS(),
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
