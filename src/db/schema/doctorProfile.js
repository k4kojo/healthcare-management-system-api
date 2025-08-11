import {
  pgTable,
  real,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const doctorProfile = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),

  doctorId: uuid("doctor_id").references(() => users.userId), // FK to users.user_id (only for doctors)

  specialization: varchar("specialization").notNull(),
  licenseNumber: varchar("license_number").notNull(),
  bio: varchar("bio", { mode: "nullable" }),

  reviews: real("reviews").notNull().default(0),
  rating: real("rating").notNull().default(0),

  experienceYears: varchar("experience_years", { mode: "nullable" }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});
