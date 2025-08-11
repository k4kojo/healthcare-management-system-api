import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatMessages } from "../db/schema/chatMessages.js";
import { chatRooms } from "../db/schema/chatRooms.js";
import { users } from "../db/schema/users.js";

// Validate chatRoomId and senderId exist
export const validateChatMessageFKs = async (req, res, next) => {
  const { chatRoomId, senderId, replyTo } = req.body;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, senderId));
    if (!user) return res.status(400).json({ error: "Invalid senderId" });

    const [chatRoom] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.chatRoomId, chatRoomId));
    if (!chatRoom) return res.status(400).json({ error: "Invalid chatRoomId" });

    if (replyTo) {
      const [message] = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.id, Number(replyTo)));
      if (!message)
        return res.status(400).json({ error: "Invalid replyTo message ID" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "FK validation failed" });
  }
};
