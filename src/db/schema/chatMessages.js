import {
  boolean,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { chatRooms } from "./chatRooms.js";
import { users } from "./users.js";

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),

  chatRoomId: uuid("chat_room_id")
    .notNull()
    .references(() => chatRooms.chatRoomId), // FK to chat_rooms
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.userId), // FK to users

  content: varchar("content", { length: 2000 }).notNull(),

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

  isRead: boolean("is_read").notNull().default(false),

  messageType: varchar("message_type").notNull().default("text"), // 'text', 'file', etc.
  fileUrl: varchar("file_url", { mode: "nullable" }),

  replyTo: uuid("reply_to", { mode: "nullable" }), // FK to chatMessages.id (self-reference)
  replyMessageType: varchar("reply_message_type", { mode: "nullable" }),
  replyFileUrl: varchar("reply_file_url", { mode: "nullable" }),
  replyContent: varchar("reply_content", { mode: "nullable" }),
});
