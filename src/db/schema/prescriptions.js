import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";
import { users } from "./users.js";

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),

  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.appointmentId), // FK to appointments.id

  // FK to doctors.id (or users.id if you don’t separate doctor users)
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId),

  medication: varchar("medication").notNull(), // Comma-separated or structured medication field

  dosage: varchar("dosage").notNull(), // e.g. "500mg"

  frequency: varchar("frequency").notNull(), // e.g. "Twice daily"

  // When the prescription starts and ends
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),

  instructions: text("instructions", { mode: "nullable" }), // Optional: patient instructions

  fileUrl: varchar("file_url", { mode: "nullable" }), // Optional: file (e.g. scanned paper Rx)

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
