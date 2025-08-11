import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId), // FK to users.id

  activityType: text("activity_type").notNull(), // e.g., "login", "logout", "appointment_booked"

  activityDetails: varchar("activity_details", { mode: "nullable" }), // Optional details for context

  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});
