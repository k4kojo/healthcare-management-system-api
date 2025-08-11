import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/users.js";

export const validateNotificationFKs = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Skip validation for global notifications
    if (userId === null || userId === undefined) return next();

    // Check user exists if notification is not global
    const user = await db.select().from(users).where(eq(users.userId, userId));

    if (!user.length) {
      return res.status(400).json({ error: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Notification FK validation error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
};
