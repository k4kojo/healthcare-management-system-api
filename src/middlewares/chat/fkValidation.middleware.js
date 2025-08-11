import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatRooms } from "../../db/schema/chatRooms.js";
import { users } from "../../db/schema/users.js";

export const validateChatMessageFKs = async (req, res, next) => {
  const { chatRoomId, senderId } = req.body;

  try {
    // Verify chat room exists
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.chatRoomId, chatRoomId));

    if (!room) {
      return res.status(400).json({ error: "Invalid chat room ID" });
    }

    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, senderId));

    if (!user) {
      return res.status(400).json({ error: "Invalid sender ID" });
    }

    // Verify user is part of the chat room
    if (room.patientId !== senderId && room.doctorId !== senderId) {
      return res.status(403).json({ error: "User not in this chat room" });
    }

    next();
  } catch (error) {
    console.error("Error in validateChatMessageFKs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
