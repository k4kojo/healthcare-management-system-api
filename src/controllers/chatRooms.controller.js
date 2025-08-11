import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatRooms } from "../db/schema/chatRooms.js";

export const getAllChatRooms = async (req, res) => {
  const { role, userId } = req.user;

  try {
    const query = db.select().from(chatRooms);

    if (role !== "admin") {
      query.where(
        or(eq(chatRooms.doctorId, userId), eq(chatRooms.patientId, userId))
      );
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error in getAllChatRooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatRoomsById = async (req, res) => {
  try {
    res.json(req.room);
  } catch (error) {
    console.error("Error in getChatRoomsById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createChatRooms = async (req, res) => {
  try {
    const [record] = await db
      .insert(chatRooms)
      .values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createChatRooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateChatRooms = async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;
  const room = req.room;

  if (role !== "admin" && room.doctorId !== userId) {
    return res.status(403).json({ error: "Unauthorized update" });
  }

  try {
    const [updated] = await db
      .update(chatRooms)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(chatRooms.chatRoomId, id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateChatRooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteChatRooms = async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(chatRooms).where(eq(chatRooms.chatRoomId, id));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteChatRooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
