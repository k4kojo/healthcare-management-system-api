import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";
import { chatRooms } from "./chatRooms.js";
import { users } from "./users.js";

export const videoCalls = pgTable("video_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatRoomId: uuid("chat_room_id")
    .notNull()
    .references(() => chatRooms.chatRoomId),
  appointmentId: uuid("appointment_id").references(
    () => appointments.appointmentId
  ),

  // Twilio-specific fields
  roomSid: varchar("room_sid", { length: 64 }).notNull(),
  compositionSid: varchar("composition_sid", { length: 64 }),
  statusCallbackUrl: varchar("status_callback_url", { length: 512 }),

  // Participants
  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.userId),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.userId),

  // Status tracking
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'in-progress', 'completed', 'failed'
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  duration: integer("duration"), // in seconds

  // Twilio media
  recordingUrl: varchar("recording_url", { length: 512 }),
  recordingAvailable: boolean("recording_available").default(false),

  // Participant tracking (stores Twilio participant SIDs)
  participants: text("participants").default("[]"), // JSON array of {sid, identity, status}

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
