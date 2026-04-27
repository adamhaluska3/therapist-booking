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
});

export const booking = sqliteTable("booking", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  availabilitySlotId: text("availability_slot_id")
    .notNull()
    .references(() => availabilitySlot.id),
  status: text("status", { enum: statusEnum }).notNull().default("pending"),
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

export const availabilitySlotRelations = relations(
  availabilitySlot,
  ({ one }) => ({
    bookings: one(booking),
  }),
);

export const bookingRelations = relations(booking, ({ one }) => ({
  user: one(user, {
    fields: [booking.userId],
    references: [user.id],
  }),
  slot: one(availabilitySlot, {
    fields: [booking.availabilitySlotId],
    references: [availabilitySlot.id],
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
