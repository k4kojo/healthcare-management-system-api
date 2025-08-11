import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatMessages } from "../db/schema/chatMessages.js";

// GET ALL (Admin/Doctor only)
export const getAllChatMessages = async (req, res) => {
  try {
    const result = await db.select().from(chatMessages);
    res.json(result);
  } catch (error) {
    console.error("Error in getAllChatMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET BY ID (handled by middleware)
export const getChatMessagesById = async (req, res) => {
  try {
    res.json(req.message);
  } catch (error) {
    console.error("Error in getChatMessagesById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CREATE
export const createChatMessages = async (req, res) => {
  try {
    const [record] = await db
      .insert(chatMessages)
      .values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createChatMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE
export const updateChatMessages = async (req, res) => {
  const { id } = req.params;

  try {
    const [updated] = await db
      .update(chatMessages)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, Number(id)))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateChatMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE
export const deleteChatMessages = async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(chatMessages).where(eq(chatMessages.id, Number(id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteChatMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
