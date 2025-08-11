import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appointments } from "../../db/schema/appointments.js";
import { users } from "../../db/schema/users.js";

export const validateLabResultRelations = async (req, res, next) => {
  const { patientId, doctorId, appointmentId } = req.body;
  const { userId, role } = req.user;

  try {
    // Validate patient exists
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.userId, patientId));

    if (!patient) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // Validate doctor exists (and is the requesting user if not admin)
    const [doctor] = await db
      .select()
      .from(users)
      .where(eq(users.userId, role === "admin" ? doctorId : userId));

    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    // Validate appointment exists and belongs to patient
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, appointmentId));

    if (!appointment) {
      return res.status(400).json({ error: "Appointment not found" });
    }

    if (appointment.patientId !== patientId) {
      return res
        .status(400)
        .json({ error: "Appointment does not belong to patient" });
    }

    next();
  } catch (error) {
    console.error("Error in validateLabResultRelations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
