import {
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId), // FK to users.id

  feedback: varchar("feedback").notNull(),

  rating: real("rating").notNull(), // e.g., 1–5

  category: text("category", { mode: "nullable" }), // Optional: e.g., 'app', 'support', 'doctor', 'feature request'

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
