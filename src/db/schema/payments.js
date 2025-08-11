import {
  pgTable,
  real,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";
import { paymentMethodEnum, paymentStatusEnum } from "./enums.js";
import { users } from "./users.js";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentId: uuid("payment_id").notNull().unique(),

  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.appointmentId),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId),

  amount: real("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  method: paymentMethodEnum("payment_method").default("Credit Card"),

  providerRef: varchar("provider_ref", { length: 255 }).unique().default(""),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
