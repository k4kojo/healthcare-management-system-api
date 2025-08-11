import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { labResults } from "../../db/schema/labResults.js";

export const verifyResultOwnership = async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  try {
    const [result] = await db
      .select()
      .from(labResults)
      .where(eq(labResults.id, Number(id)));

    if (!result) {
      return res.status(404).json({ error: "Lab result not found" });
    }

    if (role === "admin") {
      req.result = result;
      return next();
    }

    if (result.doctorId === userId || result.patientId === userId) {
      req.result = result;
      return next();
    }

    return res.status(403).json({ error: "Unauthorized access" });
  } catch (error) {
    console.error("Error in verifyResultOwnership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
