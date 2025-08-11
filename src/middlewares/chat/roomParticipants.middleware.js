import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/users.js";

export const validateRoomParticipants = async (req, res, next) => {
  const { doctorId, patientId } = req.body;

  try {
    // Verify doctor exists
    const [doctor] = await db
      .select()
      .from(users)
      .where(eq(users.userId, doctorId));

    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    // Verify patient exists
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.userId, patientId));

    if (!patient) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // Verify doctor and patient are different users
    if (doctorId === patientId) {
      return res
        .status(400)
        .json({ error: "Doctor and patient cannot be the same user" });
    }

    next();
  } catch (error) {
    console.error("Error in validateRoomParticipants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
