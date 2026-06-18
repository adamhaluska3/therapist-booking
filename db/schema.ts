import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { BookingUser } from "@/server/user/schema";
import { statusEnum, locationTypeEnum } from "@/lib/booking-enums";

export { statusEnum, locationTypeEnum };

export const bookingType = sqliteTable("booking_type", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  price: integer("price"), // price in EUR cents, e.g. 5000 = €50.00
  color: text("color").notNull().default("#427a5c"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
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
  locationType: text("location_type", { enum: locationTypeEnum }).notNull().default("onsite"),
  price: integer("price"), // snapshot of booking_type.price at time of booking
  note: text("note"),
  variableSymbol: integer("variable_symbol"),
  meetLink: text("meet_link"),
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

export const postCategories = sqliteTable('post_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
})

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  titleImage: text('title_image'),
  slug: text('slug').notNull().unique(),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$onUpdateFn(() => new Date()),
  categoryId: text('category_id').references(() => postCategories.id),
})

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

export const categoriesRelations = relations(postCategories, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(postCategories, {
    fields: [posts.categoryId],
    references: [postCategories.id],
  }),
}))

export type Booking = typeof booking.$inferSelect;
export type AvailabilitySlot = typeof availabilitySlot.$inferSelect;
export type UserNote = typeof userNote.$inferSelect;
export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type BookingType = typeof bookingType.$inferSelect;
export type BookingWithUser = Booking & { user: BookingUser | null };
export type PostCategory = typeof postCategories.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostPreview = {
  id: string,
  slug: string,
  title: string,
  titleImage: string | null,
  description: string,
  createdAt: Date,
  category: PostCategory | null
}

