import "dotenv/config";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db";
const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const USERS_COUNT = 20;
const BOOKINGS_PER_USER = 20;
const NOTES_PER_USER = 10;

const seedNames = [
  "Anna Novak",
  "Peter Kovac",
  "Lucia Hronova",
  "Martin Svoboda",
  "Eva Mlynar",
  "Jan Horak",
  "Katarina Varga",
  "Tomas Bielik",
  "Zuzana Farkas",
  "Roman Urban",
  "Marek Benes",
  "Ivana Kralova",
  "Patrik Cerny",
  "Michaela Dvorak",
  "Filip Rybak",
  "Nina Sykorova",
  "David Nemec",
  "Barbora Jelinek",
  "Ondrej Tichy",
  "Adela Prochazka",
];

const users = seedNames.slice(0, USERS_COUNT).map((fullName, i) => {
  const id = `seed-user-${fullName.toLowerCase().replace(/\s+/g, "-")}`;
  const createdAt = Date.parse(`2026-04-${12 + (i % 10)}T09:00:00.000Z`);
  const [firstName] = fullName.split(" ");
  return {
    id,
    name: fullName,
    email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    emailVerified: 1,
    createdAt,
    updatedAt: createdAt,
    role: "user",
    nickname: firstName,
    phone: `+420 900 ${100000 + i}`,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`,
  };
});

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

// Generate bookings programmatically so each user gets at least BOOKINGS_PER_USER
const bookings = [];
const notes = [];

for (let ui = 0; ui < users.length; ui++) {
  const user = users[ui];
  // bookings spaced every 2 days starting May 1, 2026
  for (let b = 0; b < BOOKINGS_PER_USER; b++) {
    const dayOffset = b * 2 + ui; // stagger across users
    const date = new Date(2026, 4, 1 + dayOffset);
    const hour = 9 + (b % 8); // hours between 9..16
    const start = Math.floor(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        0,
        0,
      ).getTime() / 1000,
    );
    const end = start + 60 * 60; // 1 hour
    const bookingId = `seed-booking-${user.id}-${b}`;
    bookings.push({
      id: bookingId,
      userId: user.id,
      start,
      end,
      status: b % 7 === 0 ? "cancelled" : b % 5 === 0 ? "pending" : "confirmed",
      clientName: user.name,
      notes: `Seeded booking #${b + 1} for ${user.name}`,
      createdAt: Date.parse(new Date(2026, 3, 20 + (b % 10)).toISOString()),
    });
  }

  // user notes
  for (let n = 0; n < NOTES_PER_USER; n++) {
    const noteDate = Math.floor(new Date(2026, 3, 1 + n + ui).getTime() / 1000);
    notes.push({
      id: `seed-note-${user.id}-${n}`,
      userId: user.id,
      date: noteDate,
      note: `Seed note ${n + 1} for ${user.name}`,
      updatedAt: Date.parse(new Date(2026, 3, 1 + n + ui).toISOString()),
    });
  }
}

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
          phone,
          image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          email_verified = excluded.email_verified,
          updated_at = excluded.updated_at,
          role = excluded.role,
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

async function upsertNotes() {
  for (const n of notes) {
    await client.execute({
      sql: `
        INSERT INTO user_note (id, user_id, date, note, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          date = excluded.date,
          note = excluded.note,
          updated_at = excluded.updated_at
      `,
      args: [n.id, n.userId, n.date, n.note, n.updatedAt],
    });
  }
}

async function main() {
  await upsertUsers();
  await upsertAvailabilitySlots();
  await upsertBookings();
  await upsertNotes();
  console.log(
    `Seeded ${users.length} users, ${availabilitySlots.length} availability slots, ${bookings.length} bookings, and ${notes.length} notes.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
