import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatRooms } from "../../db/schema/chatRooms.js";

export const verifyRoomOwnership = async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  try {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.chatRoomId, id));

    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    if (role === "admin") {
      req.room = room;
      return next();
    }

    if (room.doctorId === userId || room.patientId === userId) {
      req.room = room;
      return next();
    }

    return res.status(403).json({ error: "Unauthorized access" });
  } catch (error) {
    console.error("Error in verifyRoomOwnership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
