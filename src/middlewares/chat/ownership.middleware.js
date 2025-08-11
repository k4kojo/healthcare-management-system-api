import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatMessages } from "../../db/schema/chatMessages.js";

export const verifyMessageOwnership = async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  try {
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, Number(id)));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (role !== "admin" && message.senderId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    req.message = message;
    next();
  } catch (error) {
    console.error("Error in verifyMessageOwnership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
