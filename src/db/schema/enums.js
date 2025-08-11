import { pgEnum } from "drizzle-orm/pg-core";

export const appointmentModeEnum = pgEnum("appointment_mode_enum", [
  "Online",
  "In-person",
]);

export const paymentMethodEnum = pgEnum("payment_method_enum", [
  "MTN MoMo",
  "Telecel Cash",
  "AirtelTigo Cash",
  "Credit Card",
]);

export const paymentStatusEnum = pgEnum("payment_status_enum", [
  "pending", // No payment attempted yet
  "partial", // Partial payment received
  "completed", // Full payment received
  "failed", // Payment attempt failed
  "refunded", // Payment was refunded
  "processing", // Payment is being processed
]);

export const appointmentStatusEnum = pgEnum("appointment_status_enum", [
  "pending", // Appointment created but not confirmed
  "confirmed", // Payment received and appointment confirmed
  "cancelled", // Appointment cancelled
  "completed", // Appointment took place
  "rescheduled", // Appointment was rescheduled
]);
