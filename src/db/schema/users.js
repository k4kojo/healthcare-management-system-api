import {
  boolean,
  date,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().unique(),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  dateOfBirth: date("date_of_birth"),

  profilePicture: varchar("profile_picture").default(null),

  role: text("role", { length: 20 }).notNull().default("patient"), // e.g., 'patient', 'doctor', 'admin'
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),

  verificationToken: varchar("verification_token").default(null),
  verificationTokenExpiry: timestamp("verification_token_expiry", {
    withTimezone: true,
    mode: "date",
  }).default(null),

  resetToken: varchar("reset_token").default(null),
  resetTokenExpiry: timestamp("reset_token_expiry", {
    withTimezone: true,
    mode: "date",
  }).default(null),

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
