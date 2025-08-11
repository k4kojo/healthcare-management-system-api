import { pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const patientProfiles = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().unique(),

  // Personal
  nationalId: varchar("national_id", { length: 100 }).default(null),
  username: varchar("username", { length: 100 }).default(null),
  gender: varchar("gender", { length: 20 }).default(null),
  dateOfBirth: varchar("date_of_birth", { length: 30 }).default(null),

  // Contact / Address
  phoneNumber: varchar("phone_number", { length: 50 }).default(null),
  email: varchar("email", { length: 255 }).default(null),
  city: varchar("city", { length: 120 }).default(null),
  province: varchar("province", { length: 120 }).default(null),
  address: text("address").default(null),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});


