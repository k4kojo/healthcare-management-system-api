import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/users.js";

export const validateDoctorExists = async (req, res, next) => {
  const { doctorId } = req.body;
  const { userId, role } = req.user;

  try {
    // If doctorId is provided in request, validate it exists
    if (doctorId) {
      const [doctor] = await db
        .select()
        .from(users)
        .where(eq(users.userId, doctorId));

      if (!doctor) {
        return res.status(400).json({ error: "Doctor not found" });
      }
    }

    // For doctors creating their own availability, ensure they exist
    if (role === "doctor" && !doctorId) {
      const [doctor] = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId));

      if (!doctor) {
        return res.status(400).json({ error: "Doctor not found" });
      }
    }

    next();
  } catch (error) {
    console.error("Error in validateDoctorExists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
