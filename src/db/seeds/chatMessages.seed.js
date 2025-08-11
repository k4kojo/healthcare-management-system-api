import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatMessages } from "../schema.js";

export async function seedChatMessages(users, chatRooms) {
  try {
    // Validate inputs
    if (!Array.isArray(users) || users.length < 2) {
      throw new Error("Need at least 2 users");
    }
    if (!Array.isArray(chatRooms) || chatRooms.length < 2) {
      throw new Error("Need at least 2 chat rooms");
    }

    // Extract UUIDs from users
    const doctor = users.find((u) => u.role === "doctor");
    const patient1 = users.find(
      (u) => u.role === "patient" && u.userId !== doctor?.userId
    );
    const patient2 = users.find(
      (u) =>
        u.role === "patient" &&
        u.userId !== patient1?.userId &&
        u.userId !== doctor?.userId
    );

    if (!doctor?.userId || !patient1?.userId) {
      throw new Error("Missing required users");
    }

    // Prepare message data using exact schema column names
    const messageData = [
      // Room 1 messages
      {
        chatRoomId: chatRooms[0].chatRoomId, // Matches schema column name
        senderId: doctor.userId, // Matches schema column name
        content: "Hello, how are you feeling today?",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
      {
        chatRoomId: chatRooms[0].chatRoomId,
        senderId: patient1.userId,
        content: "I'm doing better, but still have some discomfort",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
      {
        chatRoomId: chatRooms[0].chatRoomId,
        senderId: doctor.userId,
        content: "Can you describe the discomfort?",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
      // Room 2 messages
      {
        chatRoomId: chatRooms[1].chatRoomId,
        senderId: patient2?.userId || patient1.userId,
        content: "Hi Doctor, I have a question about my test results",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
      {
        chatRoomId: chatRooms[1].chatRoomId,
        senderId: doctor.userId,
        content: "I can send you the lab report. Please review it",
        messageType: "text",
        isRead: true,
        createdAt: sql`now()`,
        updatedAt: sql`now()`,
      },
    ];

    // Insert messages
    const insertedMessages = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();

    console.log(`💬 Seeded ${insertedMessages.length} chat messages`);
    return insertedMessages;
  } catch (error) {
    console.error("❌ Error seeding chat messages:", error);
    throw error;
  }
}
