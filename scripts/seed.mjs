import "dotenv/config";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db";
const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const USERS_COUNT = 20;
const SLOTS_COUNT = 20;
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
  const start = new Date(2026, 3, 1);
  const end = new Date(2026, 6, 1);
  while (true) {
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    if (isWeekday(date)) return date;
  }
};

async function main() {
  const statements = [];

  // 1. Generate Deterministic Users
  const users = seedNames.slice(0, USERS_COUNT).map((fullName, i) => {
    const id = `seed-user-${i}`; // Deterministic ID
    const createdAt = Date.parse(`2026-03-01T09:00:00.000Z`);
    const [firstName] = fullName.split(" ");
    return {
      id,
      name: fullName,
      email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: `+420 900 ${100000 + i}`,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`,
      createdAt,
    };
  });

  for (const u of users) {
    statements.push({
      sql: `INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, phone, image) 
            VALUES (?, ?, ?, 1, ?, ?, 'user', ?, ?) 
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email`,
      args: [u.id, u.name, u.email, u.createdAt, u.createdAt, u.phone, u.image],
    });
  }

  // 2. Generate Deterministic Availability Slots
  const availabilitySlots = [];
  for (let i = 0; i < SLOTS_COUNT; i++) {
    const date = getRandomWeekday();
    const start = Math.floor(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        9,
        0,
        0,
      ).getTime() / 1000,
    );
    const end = Math.floor(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        18,
        0,
        0,
      ).getTime() / 1000,
    );

    const slotId = `seed-slot-${i}`; // Deterministic ID
    availabilitySlots.push({ id: slotId, start, end });

    statements.push({
      sql: `INSERT INTO availability_slot (id, start, end, label) VALUES (?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET start=excluded.start, end=excluded.end`,
      args: [slotId, start, end, `Working Day ${i + 1}`],
    });
  }

  // 3. Generate Bookings (3-7 per user)
  const bookings = [];
  users.forEach((user, userIdx) => {
    const numBookings = getRandomInt(3, 7);
    let count = 0;
    let attempts = 0;

    while (count < numBookings && attempts < 100) {
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

      // Check overlap
      const hasOverlap = bookings.some((b) => bStart < b.end && bEnd > b.start);

      if (!hasOverlap) {
        const bookingId = `seed-booking-${userIdx}-${count}`; // Deterministic ID
        const statusRoll = Math.random();
        let status;

        if (bStart < MAY_FIRST_2026) {
          status = statusRoll < 0.1 ? "cancelled" : "finished";
        } else {
          status =
            statusRoll < 0.15
              ? "cancelled"
              : statusRoll < 0.4
                ? "pending"
                : "confirmed";
        }

        const booking = { id: bookingId, start: bStart, end: bEnd };
        bookings.push(booking);

        statements.push({
          sql: `INSERT INTO booking (id, user_id, start, end, status, client_name, notes, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
                ON CONFLICT(id) DO UPDATE SET status=excluded.status, start=excluded.start, end=excluded.end`,
          args: [
            bookingId,
            user.id,
            bStart,
            bEnd,
            status,
            user.name,
            `Seeded ${status} booking`,
            Date.now(),
          ],
        });
        count++;
      }
    }
  });

  // 4. Batch Execute
  console.log("Starting database sync...");
  try {
    await client.batch(statements, "write");
    console.log(
      `Success! Synced ${users.length} users and ${bookings.length} bookings.`,
    );
  } catch (e) {
    console.error("Batch failed:", e);
  }
}

main().catch(console.error);
