import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appointments, prescriptions } from "../../db/schema.js";

export const checkPrescriptionOwnership = async (req, res, next) => {
  try {
    const prescriptionId = req.params.id;
    const { userId, role } = req.user;

    const prescription = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, Number(prescriptionId)));

    if (!prescription.length) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Admins can access any prescription
    if (role === "admin") {
      req.prescription = prescription[0];
      return next();
    }

    // Get related appointment
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, prescription[0].appointmentId));

    // Doctors can access their own prescriptions
    if (role === "doctor" && prescription[0].doctorId === userId) {
      req.prescription = prescription[0];
      return next();
    }

    // Patients can access their own prescriptions
    if (role === "patient" && appointment[0]?.patientId === userId) {
      req.prescription = prescription[0];
      return next();
    }

    return res
      .status(403)
      .json({ error: "Unauthorized access to prescription" });
  } catch (error) {
    console.error("Prescription ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkPatientPrescriptionsAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Admins and doctors can access all prescriptions through their own routes
    if (role !== "patient") return next();

    // Ensure patients can only access their own prescriptions
    if (req.params.patientId && req.params.patientId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to prescriptions" });
    }

    next();
  } catch (error) {
    console.error("Patient prescriptions access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
