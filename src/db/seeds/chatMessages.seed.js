import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatMessages } from "../schema.js";

export async function seedChatMessages(users, chatRooms) {
  try {
    if (!Array.isArray(chatRooms) || chatRooms.length === 0) {
      throw new Error("Need chat rooms to seed messages");
    }

    const messageData = chatRooms.flatMap((room, idx) => [
      {
        chatRoomId: room.chatRoomId,
        senderId: room.doctorId,
        content: "Hello, how are you feeling today?",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
      {
        chatRoomId: room.chatRoomId,
        senderId: room.patientId,
        content: "I'm doing better, thanks for checking in.",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
    ]);

    const insertedMessages = await db.insert(chatMessages).values(messageData).returning();
    console.log(`💬 Seeded ${insertedMessages.length} chat messages across ${chatRooms.length} rooms`);
    return insertedMessages;
  } catch (error) {
    console.error("❌ Error seeding chat messages:", error);
    throw error;
  }
}
