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

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),

  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId),

  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId),

  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.appointmentId),

  recordType: text("record_type").notNull().default("general"), // 'allergy', 'vaccination', etc.

  diagnosis: varchar("diagnosis", { length: 255 }).notNull(),
  treatment: text("treatment").notNull(),
  notes: text("notes").default(""),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
