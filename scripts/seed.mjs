import "dotenv/config";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db";
const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const users = [
  {
    id: "seed-user-anna-novak",
    name: "Anna Nováková",
    email: "anna.novakova@example.com",
    emailVerified: 1,
    createdAt: Date.parse("2026-04-12T09:00:00.000Z"),
    updatedAt: Date.parse("2026-04-12T09:00:00.000Z"),
    role: "user",
    nickname: "Anna",
    phone: "+421 900 111 222",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
  },
  {
    id: "seed-user-peter-kovac",
    name: "Peter Kováč",
    email: "peter.kovac@example.com",
    emailVerified: 1,
    createdAt: Date.parse("2026-04-13T09:00:00.000Z"),
    updatedAt: Date.parse("2026-04-13T09:00:00.000Z"),
    role: "user",
    nickname: "Peter",
    phone: "+421 900 333 444",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter",
  },
  {
    id: "seed-user-lucia-hronova",
    name: "Lucia Hronová",
    email: "lucia.hronova@example.com",
    emailVerified: 1,
    createdAt: Date.parse("2026-04-14T09:00:00.000Z"),
    updatedAt: Date.parse("2026-04-14T09:00:00.000Z"),
    role: "user",
    nickname: "Lucia",
    phone: "+421 900 555 666",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia",
  },
];

const availabilitySlots = [
  {
    id: "seed-slot-2026-05-04",
    start: Math.floor(new Date(2026, 4, 4, 9, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 4, 17, 0, 0, 0).getTime() / 1000),
    label: "Monday availability",
  },
  {
    id: "seed-slot-2026-05-11",
    start: Math.floor(new Date(2026, 4, 11, 9, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 11, 17, 0, 0, 0).getTime() / 1000),
    label: "Monday availability",
  },
  {
    id: "seed-slot-2026-05-18",
    start: Math.floor(new Date(2026, 4, 18, 9, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 18, 17, 0, 0, 0).getTime() / 1000),
    label: "Monday availability",
  },
  {
    id: "seed-slot-2026-05-25",
    start: Math.floor(new Date(2026, 4, 25, 9, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 25, 17, 0, 0, 0).getTime() / 1000),
    label: "Monday availability",
  },
];

const bookings = [
  {
    id: "seed-booking-anna-2026-05-04-10",
    userId: "seed-user-anna-novak",
    start: Math.floor(new Date(2026, 4, 4, 10, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 4, 11, 0, 0, 0).getTime() / 1000),
    status: "confirmed",
    clientName: "Anna Nováková",
    notes: "Follow-up session about work stress.",
    createdAt: Date.parse("2026-04-20T10:00:00.000Z"),
  },
  {
    id: "seed-booking-peter-2026-05-11-14",
    userId: "seed-user-peter-kovac",
    start: Math.floor(new Date(2026, 4, 11, 14, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 11, 15, 0, 0, 0).getTime() / 1000),
    status: "confirmed",
    clientName: "Peter Kováč",
    notes: "Initial consultation.",
    createdAt: Date.parse("2026-04-20T10:05:00.000Z"),
  },
  {
    id: "seed-booking-lucia-2026-05-18-09",
    userId: "seed-user-lucia-hronova",
    start: Math.floor(new Date(2026, 4, 18, 9, 0, 0, 0).getTime() / 1000),
    end: Math.floor(new Date(2026, 4, 18, 10, 0, 0, 0).getTime() / 1000),
    status: "confirmed",
    clientName: "Lucia Hronová",
    notes: "Morning check-in.",
    createdAt: Date.parse("2026-04-20T10:10:00.000Z"),
  },
];

async function upsertUsers() {
  for (const user of users) {
    await client.execute({
      sql: `
        INSERT INTO user (
          id,
          name,
          email,
          email_verified,
          created_at,
          updated_at,
          role,
          nickname,
          phone,
          image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          email_verified = excluded.email_verified,
          updated_at = excluded.updated_at,
          role = excluded.role,
          nickname = excluded.nickname,
          phone = excluded.phone,
          image = excluded.image
      `,
      args: [
        user.id,
        user.name,
        user.email,
        user.emailVerified,
        user.createdAt,
        user.updatedAt,
        user.role,
        user.nickname,
        user.phone,
        user.image,
      ],
    });
  }
}

async function upsertAvailabilitySlots() {
  for (const slot of availabilitySlots) {
    await client.execute({
      sql: `
        INSERT INTO availability_slot (id, start, end, label)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          start = excluded.start,
          end = excluded.end,
          label = excluded.label
      `,
      args: [slot.id, slot.start, slot.end, slot.label],
    });
  }
}

async function upsertBookings() {
  for (const booking of bookings) {
    await client.execute({
      sql: `
        INSERT INTO booking (id, user_id, start, end, status, client_name, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          start = excluded.start,
          end = excluded.end,
          status = excluded.status,
          client_name = excluded.client_name,
          notes = excluded.notes,
          created_at = excluded.created_at
      `,
      args: [
        booking.id,
        booking.userId,
        booking.start,
        booking.end,
        booking.status,
        booking.clientName,
        booking.notes,
        booking.createdAt,
      ],
    });
  }
}

async function main() {
  await upsertUsers();
  await upsertAvailabilitySlots();
  await upsertBookings();
  console.log(
    `Seeded ${users.length} users, ${availabilitySlots.length} availability slots, and ${bookings.length} bookings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
