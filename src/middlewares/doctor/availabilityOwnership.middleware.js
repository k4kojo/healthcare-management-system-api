import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { doctorAvailability } from "../../db/schema/doctorAvailability.js";

export const verifyAvailabilityOwnership = async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  // Validate that id is provided and is a valid number
  if (!id || isNaN(id) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ 
      error: "Invalid availability ID. Must be a positive integer." 
    });
  }

  try {
    const [availability] = await db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.id, Number(id)));

    if (!availability) {
      return res.status(404).json({ error: "Availability record not found" });
    }

    if (role !== "admin" && availability.doctorId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    req.availability = availability;
    next();
  } catch (error) {
    console.error("Error in verifyAvailabilityOwnership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
