import "dotenv/config";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

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

const BOOKING_TYPES = [
  { id: "bt-psychoterapia", name: "Psychoterapia", price: 6000 },  // €60
  { id: "bt-supervizia",   name: "Supervízia",    price: 7000 },  // €70
  { id: "bt-seminare",     name: "Semináre",      price: 4000 },  // €40
  { id: "bt-koucing",      name: "Koučing",       price: 5500 },  // €55
  { id: "bt-outdoor",      name: "Outdoor terapia", price: 6500 }, // €65
];

async function main() {
  // Copy blog images into uploads/ so they can be deleted independently
  const uploadsDir = resolve(publicDir, "uploads");
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  const imagesToCopy = [
    { src: "images/blog/blog-1.png", dest: "uploads/seed-blog-1.png" },
    { src: "images/blog/blog-3.png", dest: "uploads/seed-blog-3.png" },
    { src: "images/blog/blog-5.png", dest: "uploads/seed-blog-5.png" },
  ];
  for (const { src, dest } of imagesToCopy) {
    copyFileSync(resolve(publicDir, src), resolve(publicDir, dest));
  }
  console.log("Copied seed images to uploads/");

  const statements = [];

  // 0. Seed Booking Types
  for (const bt of BOOKING_TYPES) {
    statements.push({
      sql: `INSERT INTO booking_type (id, name, price) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, price=excluded.price`,
      args: [bt.id, bt.name, bt.price],
    });
  }

  // 0b. Seed Payment Settings
  statements.push({
    sql: `INSERT INTO payment_settings (id, iban, bic, beneficiary_name, payment_note)
          VALUES ('singleton', ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            iban=excluded.iban,
            bic=excluded.bic,
            beneficiary_name=excluded.beneficiary_name,
            payment_note=excluded.payment_note`,
    args: [
      "SK8209000000000011424060",
      "TATRSKBX",
      "Jana Nováková",
      "Terapia",
    ],
  });

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
  const usedDates = new Set();
  let i = 0;
  while (availabilitySlots.length < SLOTS_COUNT) {
    const date = getRandomWeekday();
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (usedDates.has(dateKey)) continue;
    usedDates.add(dateKey);

    const start = Math.floor(
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0).getTime() / 1000,
    );
    const end = Math.floor(
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0).getTime() / 1000,
    );

    const slotId = `seed-slot-${i}`;
    availabilitySlots.push({ id: slotId, start, end });

    statements.push({
      sql: `INSERT INTO availability_slot (id, start, end, label) VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET start=excluded.start, end=excluded.end`,
      args: [slotId, start, end, `Working Day ${i + 1}`],
    });
    i++;
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

        const bookingType = BOOKING_TYPES[getRandomInt(0, BOOKING_TYPES.length - 1)];
        const booking = { id: bookingId, start: bStart, end: bEnd };
        bookings.push(booking);

        statements.push({
          sql: `INSERT INTO booking (id, user_id, booking_type_id, start, end, status, price, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET status=excluded.status, start=excluded.start, end=excluded.end`,
          args: [
            bookingId,
            user.id,
            bookingType.id,
            bStart,
            bEnd,
            status,
            bookingType.price,
            Date.now(),
          ],
        });
        count++;
      }
    }
  });

  // 4. Seed Post Categories and Posts
  const postCategoryId = "seed-cat-terapia";
  statements.push({
    sql: `INSERT INTO post_categories (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name`,
    args: [postCategoryId, "Terapia"],
  });

  const seedPosts = [
    {
      id: "seed-post-1",
      title: "Čo je psychoterapia a komu pomáha?",
      description: "Psychoterapia je odborná pomoc pri riešení psychických ťažkostí. Zistite, pre koho je vhodná a čo môžete očakávať.",
      content: "<p>Psychoterapia je forma odbornej pomoci, ktorá využíva rozhovor a rôzne techniky na liečbu psychických ťažkostí. Je vhodná pre každého, kto sa cíti preťažený, úzkostný alebo hľadá lepšie porozumenie sebe samému.</p><p>Terapeut vytvára bezpečný priestor, v ktorom môžete slobodne hovoriť o svojich pocitoch bez odsúdenia. Spolupracujete na pochopení vašich vzorcov myslenia a správania a hľadáte zdravšie spôsoby zvládania každodenných situácií.</p>",
      slug: "co-je-psychoterapia",
      titleImage: "/uploads/seed-blog-1.png",
      categoryId: postCategoryId,
      isPublic: 1,
      createdAt: Math.floor(new Date("2026-03-10").getTime() / 1000),
    },
    {
      id: "seed-post-2",
      title: "Outdoor terapia: liečivá sila prírody",
      description: "Terapeutické sedenia v prírode ponúkajú jedinečný zážitok. Prečítajte si, prečo je príroda mocným spojencom v procese uzdravovania.",
      content: "<p>Outdoor terapia spája tradičné terapeutické prístupy s liečivým prostredím prírody. Pohyb, čerstvý vzduch a kontakt so živou prírodou výrazne prehlbujú terapeutický proces.</p><p>Výskumy potvrdzujú, že pobyt v prírode znižuje hladinu kortizolu, zlepšuje náladu a podporuje kreativitu. Sedenia v lese alebo pri vode môžu byť mimoriadne účinné pri zvládaní stresu a úzkosti.</p>",
      slug: "outdoor-terapia-priroda",
      titleImage: "/uploads/seed-blog-3.png",
      categoryId: postCategoryId,
      isPublic: 1,
      createdAt: Math.floor(new Date("2026-04-02").getTime() / 1000),
    },
    {
      id: "seed-post-3",
      title: "Ako sa pripraviť na prvé terapeutické sedenie",
      description: "Prvé stretnutie s terapeutom môže byť nervózne. Tu je niekoľko tipov, ako sa naň pripraviť a čo očakávať.",
      content: "<p>Prvé sedenie je predovšetkým spoznávanie – terapeut sa vám bude chcieť dozvedieť viac o vás a o dôvode, prečo ste prišli. Nemusíte mať pripravené odpovede na všetky otázky.</p><p>Odporúčame si vopred premyslieť, čo vás trápi najviac a čo by ste chceli v terapii dosiahnuť. Pamätajte, že terapia je spolupráca – váš terapeut je tu na to, aby vám pomohol, nie aby vás hodnotil.</p>",
      slug: "prvé-terapeuticke-sedenie",
      titleImage: "/uploads/seed-blog-5.png",
      categoryId: null,
      isPublic: 1,
      createdAt: Math.floor(new Date("2026-04-20").getTime() / 1000),
    },
  ];

  for (const post of seedPosts) {
    statements.push({
      sql: `INSERT INTO posts (id, title, description, content, slug, title_image, is_public, category_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET title=excluded.title, slug=excluded.slug`,
      args: [post.id, post.title, post.description, post.content, post.slug, post.titleImage, post.isPublic, post.categoryId, post.createdAt, post.createdAt],
    });
  }

  // 5. Batch Execute
  console.log("Starting database sync...");
  try {
    await client.batch(statements, "write");
    console.log(
      `Success! Synced ${users.length} users, ${bookings.length} bookings and ${seedPosts.length} blog posts.`,
    );
  } catch (e) {
    console.error("Batch failed:", e);
  }
}

main().catch(console.error);
