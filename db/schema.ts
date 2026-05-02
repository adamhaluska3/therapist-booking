import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const statusEnum = [
  "pending",
  "confirmed",
  "cancelled",
  "finished",
] as const;

export const bookingType = sqliteTable("booking_type", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  price: integer("price"), // price in EUR cents, e.g. 5000 = €50.00
});

export const availabilitySlot = sqliteTable("availability_slot", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  start: integer("start", { mode: "timestamp" }).notNull(),
  end: integer("end", { mode: "timestamp" }).notNull(),
  label: text("label"),
});

export const booking = sqliteTable("booking", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  bookingTypeId: text("booking_type_id").references(() => bookingType.id, { onDelete: "set null" }),
  start: integer("start", { mode: "timestamp" }).notNull(),
  end: integer("end", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: statusEnum }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userNote = sqliteTable("user_note", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: integer("date", { mode: "timestamp" }).notNull(),
  note: text("note").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const bookingRelations = relations(booking, ({ one }) => ({
  user: one(user, {
    fields: [booking.userId],
    references: [user.id],
  }),
  bookingType: one(bookingType, {
    fields: [booking.bookingTypeId],
    references: [bookingType.id],
  }),
}));

export const userNoteRelations = relations(userNote, ({ one }) => ({
  user: one(user, {
    fields: [userNote.userId],
    references: [user.id],
  }),
}));

export const paymentSettings = sqliteTable("payment_settings", {
  id: text("id").primaryKey().default("singleton"),
  iban: text("iban"),
  bic: text("bic"),
  beneficiaryName: text("beneficiary_name"),
  paymentNote: text("payment_note"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
    () => new Date(),
  ),
});

export type Booking = typeof booking.$inferSelect;
export type AvailabilitySlot = typeof availabilitySlot.$inferSelect;
export type UserNote = typeof userNote.$inferSelect;
export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type BookingType = typeof bookingType.$inferSelect;

export type BookingUser = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
};

export type BookingWithUser = Booking & { user: BookingUser | null };
