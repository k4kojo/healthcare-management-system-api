import {
  pgTable,
  real,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";
import { users } from "./users.js";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),

  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId),
  appointmentId: uuid("appointment_id", { mode: "nullable" }).references(
    () => appointments.appointmentId
  ),

  rating: real("rating").notNull(), // Typically 1–5

  comment: varchar("comment", { mode: "nullable" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
