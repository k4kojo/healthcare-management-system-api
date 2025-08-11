import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { doctorProfile } from "../../db/schema/doctorProfile.js";

export const verifyProfileOwnership = async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  try {
    const [profile] = await db
      .select()
      .from(doctorProfile)
      .where(eq(doctorProfile.id, Number(id)));

    if (!profile) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    if (role !== "admin" && profile.doctorId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    req.profile = profile;
    next();
  } catch (error) {
    console.error("Error in verifyProfileOwnership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
