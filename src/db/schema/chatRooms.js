import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const chatRooms = pgTable("chat_rooms", {
  chatRoomId: uuid("chatroom_id").primaryKey(),

  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId),

  hasActiveCall: boolean("has_active_call").default(false),
  currentCallId: uuid("current_call_id"),
  callProvider: varchar("call_provider", { length: 50 }),
  callRoomUrl: varchar("call_room_url", { length: 512 }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});
