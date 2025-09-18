import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { medications } from "./medications.js";

export const medicationStatusEnum = pgEnum("medication_status_enum", [
  "taken",
  "skipped", 
  "missed",
]);

export const medicationLogs = pgTable("medication_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  medicationId: uuid("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  takenAt: timestamp("taken_at", {
    withTimezone: true,
    mode: "date",
  }).notNull().defaultNow(),
  status: medicationStatusEnum("status").notNull(),
  notes: text("notes"), // Optional notes from patient
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});
