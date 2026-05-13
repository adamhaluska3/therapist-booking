import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { booking } from "@/db/schema";
import { user } from "@/db/auth-schema";
import { eq, gte } from "drizzle-orm";
import { generateIcsFeed } from "@/lib/ics";
import { UNKNOWN_CLIENT } from "@/lib/constants";

const FEED_TOKEN = process.env.CALENDAR_FEED_TOKEN;

export async function GET(req: NextRequest) {
  if (!FEED_TOKEN) {
    return new NextResponse("Calendar feed not configured", { status: 404 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (token !== FEED_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const rows = await db
    .select()
    .from(booking)
    .leftJoin(user, eq(booking.userId, user.id))
    .where(gte(booking.start, startOfToday));

  const events = rows.map((row) => {
    const clientName = row.user?.nickname ?? row.user?.name ?? UNKNOWN_CLIENT;
    return {
      uid: row.booking.id,
      start: row.booking.start,
      end: row.booking.end,
      summary: clientName,
      description: `Stav: ${row.booking.status}`,
    };
  });

  const ics = generateIcsFeed(events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
    },
  });
}
