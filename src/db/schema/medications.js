import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  prescribedBy: uuid("prescribed_by").references(() => users.userId, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(), // e.g., "500mg"
  frequency: varchar("frequency", { length: 100 }).notNull(), // e.g., "2 times/day"
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // Optional - null means ongoing
  instructions: text("instructions"), // Additional instructions
  isActive: boolean("is_active").notNull().default(true),
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
