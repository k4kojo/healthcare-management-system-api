import { pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";
import { users } from "./users.js";

export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),

  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId), // FK to users.user_id (patient)
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId), // FK to users.user_id (doctor)
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.appointmentId), // FK to appointments.id

  testName: varchar("test_name").notNull(),
  result: varchar("result").notNull(),
  resultDate: timestamp("result_date", {
    withTimezone: true,
    mode: "date",
  }).notNull(),

  notes: varchar("notes", { mode: "nullable" }),
  fileUrl: varchar("file_url", { mode: "nullable" }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});
