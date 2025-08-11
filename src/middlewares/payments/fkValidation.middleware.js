import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appointments, users } from "../../db/schema.js";

export const validatePaymentFKs = async (req, res, next) => {
  try {
    const { userId, appointmentId } = req.body;

    // Check user exists
    const user = await db.select().from(users).where(eq(users.userId, userId));
    if (!user.length) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check appointment exists
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, appointmentId));
    if (!appointment.length) {
      return res.status(400).json({ error: "Appointment not found" });
    }

    // Verify appointment belongs to user
    if (appointment[0].patientId !== userId) {
      return res
        .status(400)
        .json({ error: "Appointment doesn't belong to user" });
    }

    next();
  } catch (error) {
    console.error("Payment FK validation error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
};
