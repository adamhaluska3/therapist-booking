import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const statusEnum = [
  "pending",
  "confirmed",
  "cancelled",
  "finished",
] as const;

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
}));

export const userNoteRelations = relations(userNote, ({ one }) => ({
  user: one(user, {
    fields: [userNote.userId],
    references: [user.id],
  }),
}));

export type Booking = typeof booking.$inferSelect;
export type AvailabilitySlot = typeof availabilitySlot.$inferSelect;
export type UserNote = typeof userNote.$inferSelect;

export type BookingUser = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
};

export type BookingWithUser = Booking & { user: BookingUser | null };
