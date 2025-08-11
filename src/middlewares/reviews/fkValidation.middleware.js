import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appointments, users } from "../../db/schema.js";

export const validateReviewFKs = async (req, res, next) => {
  try {
    const { doctorId, appointmentId } = req.body;

    // Check doctor exists and is actually a doctor
    const doctor = await db
      .select()
      .from(users)
      .where(eq(users.userId, doctorId))
      .where(eq(users.role, "doctor"));
    if (!doctor.length) {
      return res
        .status(400)
        .json({ error: "Invalid doctor ID or not a doctor" });
    }

    // Check appointment exists if provided
    if (appointmentId) {
      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.appointmentId, appointmentId));
      if (!appointment.length) {
        return res.status(400).json({ error: "Invalid appointment ID" });
      }

      // Verify appointment belongs to this patient-doctor pair
      if (
        appointment[0].patientId !== req.user.userId ||
        appointment[0].doctorId !== doctorId
      ) {
        return res.status(400).json({
          error: "Appointment doesn't belong to this patient-doctor pair",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Review FK validation error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
};
