import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { medications } from "./medications.js";

export const medicationReminders = pgTable("medication_reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  medicationId: uuid("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  remindAt: timestamp("remind_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  sent: boolean("sent").notNull().default(false),
  sentAt: timestamp("sent_at", {
    withTimezone: true,
    mode: "date",
  }),
  message: text("message"), // Custom reminder message
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});
