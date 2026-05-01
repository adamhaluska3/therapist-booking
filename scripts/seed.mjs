import "dotenv/config";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db";
const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const USERS_COUNT = 20;
const AVAILABILITY_SLOTS_COUNT = 20;
const MAY_FIRST_2026 = Math.floor(new Date(2026, 4, 1).getTime() / 1000);

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

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const getRandomWeekday = () => {
  const start = new Date(2026, 3, 1); // April 1
  const end = new Date(2026, 6, 1); // July 1
  while (true) {
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    if (isWeekday(date)) return date;
  }
};

// 1. Generate Users
const users = seedNames.slice(0, USERS_COUNT).map((fullName, i) => {
  const id = `seed-user-${fullName.toLowerCase().replace(/\s+/g, "-")}`;
  const createdAt = Date.parse(`2026-03-${10 + (i % 15)}T09:00:00.000Z`);
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

// 2. Generate 20 Availability Slots (9 AM to 6 PM)
const availabilitySlots = [];
for (let i = 0; i < AVAILABILITY_SLOTS_COUNT; i++) {
  const date = getRandomWeekday();
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    9,
    0,
    0,
  );
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    18,
    0,
    0,
  );

  availabilitySlots.push({
    id: `seed-slot-${i}-${date.toISOString().split("T")[0]}`,
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
    label: `Working Day Slot ${i + 1}`,
  });
}

// 3. Generate Bookings
const bookings = [];
const notes = [];

users.forEach((user) => {
  const numBookings = getRandomInt(3, 7);
  let userBookingsCount = 0;
  let attempts = 0;

  while (userBookingsCount < numBookings && attempts < 100) {
    attempts++;
    const slot =
      availabilitySlots[getRandomInt(0, availabilitySlots.length - 1)];
    const randomHour = getRandomInt(9, 17);
    const slotDate = new Date(slot.start * 1000);
    const bStart = Math.floor(
      new Date(
        slotDate.getFullYear(),
        slotDate.getMonth(),
        slotDate.getDate(),
        randomHour,
        0,
        0,
      ).getTime() / 1000,
    );
    const bEnd = bStart + 3600;

    const hasOverlap = bookings.some((b) => bStart < b.end && bEnd > b.start);

    if (!hasOverlap) {
      const statusRoll = Math.random();
      let status;

      // Logic: If older than May 1st, set to finished or cancelled
      // If after May 1st, set to cancelled, pending, or confirmed
      if (bStart < MAY_FIRST_2026) {
        status = statusRoll < 0.15 ? "cancelled" : "finished";
      } else {
        if (statusRoll < 0.15) {
          status = "cancelled";
        } else if (statusRoll < 0.5) {
          status = "pending";
        } else {
          status = "confirmed";
        }
      }

      bookings.push({
        id: `seed-booking-${user.id}-${userBookingsCount}`,
        userId: user.id,
        start: bStart,
        end: bEnd,
        status: status,
        clientName: user.name,
        notes: `Seeded ${status} booking for ${user.name}`,
        createdAt: Date.now(),
      });
      userBookingsCount++;
    }
  }

  for (let n = 0; n < 10; n++) {
    notes.push({
      id: `seed-note-${user.id}-${n}`,
      userId: user.id,
      date: Math.floor(Date.now() / 1000) - n * 86400,
      note: `Seed note ${n + 1} for ${user.name}`,
      updatedAt: Date.now(),
    });
  }
});

// Upsert functions remain the same to maintain schema compatibility
async function upsertUsers() {
  for (const user of users) {
    await client.execute({
      sql: `INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, phone, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET name = excluded.name`,
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
      sql: `INSERT INTO availability_slot (id, start, end, label) VALUES (?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET start = excluded.start, end = excluded.end`,
      args: [slot.id, slot.start, slot.end, slot.label],
    });
  }
}

async function upsertBookings() {
  for (const booking of bookings) {
    await client.execute({
      sql: `INSERT INTO booking (id, user_id, start, end, status, client_name, notes, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status`,
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
      sql: `INSERT INTO user_note (id, user_id, date, note, updated_at) VALUES (?, ?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET note = excluded.note`,
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
    `Seeding complete: ${users.length} users, ${availabilitySlots.length} slots, ${bookings.length} bookings.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
