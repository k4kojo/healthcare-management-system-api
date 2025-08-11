import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appointments } from "../../db/schema/appointments.js";

export const checkAppointmentOwnership = async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  if (!id) {
    return res.status(400).json({ error: "Appointment ID is required" });
  }

  try {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, id));

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Admin has full access
    if (role === "admin") {
      req.appointment = appointment;
      return next();
    }

    // Doctor can access their own appointments
    if (role === "doctor" && appointment.doctorId === userId) {
      req.appointment = appointment;
      return next();
    }

    // Patient can access their own appointments
    if (role === "patient" && appointment.patientId === userId) {
      req.appointment = appointment;
      return next();
    }

    return res.status(403).json({ error: "Unauthorized access" });
  } catch (error) {
    console.error("Error checking appointment ownership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
