import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/users.js";

export const validateUserActivityLogFKs = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Check user exists
    const user = await db.select().from(users).where(eq(users.userId, userId));

    if (!user.length) {
      return res.status(400).json({ error: "User not found" });
    }

    next();
  } catch (error) {
    console.error("User Activity Log FK validation error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
};
