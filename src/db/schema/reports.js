import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportId: uuid("report_id").notNull().unique().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // overview, patients, revenue, staff, inventory, custom
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.userId),
  fileSize: varchar("file_size", { length: 20 }).default(null),
  fileName: varchar("file_name", { length: 255 }).default(null),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});