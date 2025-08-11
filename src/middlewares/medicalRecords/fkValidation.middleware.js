import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appointments } from "../../db/schema/appointments.js";
import { users } from "../../db/schema/users.js";

export const validateMedicalRecordFKs = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentId } = req.body;

    // Check patient exists
    const patient = await db
      .select()
      .from(users)
      .where(eq(users.userId, patientId));
    if (!patient.length) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // Check doctor exists
    const doctor = await db
      .select()
      .from(users)
      .where(eq(users.userId, doctorId));
    if (!doctor.length) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    // Check appointment exists and matches patient/doctor
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, appointmentId));
    if (!appointment.length) {
      return res.status(400).json({ error: "Appointment not found" });
    }

    if (
      appointment[0].patientId !== patientId ||
      appointment[0].doctorId !== doctorId
    ) {
      return res
        .status(400)
        .json({ error: "Appointment doesn't match patient/doctor" });
    }

    next();
  } catch (error) {
    console.error("FK validation error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
};
