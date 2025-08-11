import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const doctorAvailability = pgTable("doctor_availability", {
  id: serial("id").primaryKey(),

  doctorId: uuid("doctor_id").references(() => users.userId), // FK to users.user_id (doctors only)

  availableFrom: timestamp("available_from", {
    withTimezone: true,
    mode: "date",
  }).notNull(),

  availableTo: timestamp("available_to", {
    withTimezone: true,
    mode: "date",
  }).notNull(),

  dayOfWeek: integer("day_of_week"), // 0-6 (Sunday-Saturday)

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});
