import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/users.js";

export const validateDoctorExists = async (req, res, next) => {
  const { doctorId } = req.body;

  if (!doctorId) {
    return res.status(400).json({ error: "doctorId is required" });
  }

  try {
    const [doctor] = await db
      .select()
      .from(users)
      .where(eq(users.userId, doctorId));

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    req.doctor = doctor; // Attach doctor to request for later use
    next();
  } catch (error) {
    console.error("Error validating doctor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
