import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatMessages } from "../db/schema/chatMessages.js";

export const verifyOwnership = (table, idColumn, userColumn) => {
  return async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const [record] = await db
      .select()
      .from(table)
      .where(eq(idColumn, Number(id)));

    if (!record) {
      return res.status(404).json({ error: "Resource not found" });
    }

    if (record[userColumn] !== userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    next();
  };
};

export const verifyMessageOwnership = async (req, res, next) => {
  const messageId = Number(req.params.id);
  const userId = req.user.userId;

  try {
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId));
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    req.message = message; // pass message downstream if needed
    next();
  } catch (err) {
    return res.status(500).json({ error: "Ownership validation failed" });
  }
};
