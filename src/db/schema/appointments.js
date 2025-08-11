import { pgTable, real, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
  appointmentModeEnum,
  appointmentStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "./enums.js";
import { users } from "./users.js";

export const appointments = pgTable("appointments", {
  appointmentId: uuid("appointment_id").primaryKey().defaultRandom(),

  // Relationships
  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId),

  // Appointment details
  appointmentDate: timestamp("appointment_date", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  appointmentMode: appointmentModeEnum("appointment_mode")
    .notNull()
    .default("Online"),
  reasonForVisit: varchar("reason_for_visit", { length: 500 }),

  // Payment information
  appointmentAmount: real("appointment_amount").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  paymentDate: timestamp("payment_date", { withTimezone: true, mode: "date" }),

  // Status tracking
  status: appointmentStatusEnum("status").notNull().default("pending"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
