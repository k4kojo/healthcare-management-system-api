import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { prescriptions } from "../db/schema/prescriptions.js";

export const getPrescriptionById = async (req, res) => {
  try {
    res.json(req.prescription); // Already fetched by middleware
  } catch (error) {
    console.error("Error in getPrescriptionById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPatientPrescriptions = async (req, res) => {
  try {
    const { userId } = req.user;

    // For patients, get their prescriptions via appointments
    const result = await db
      .select()
      .from(prescriptions)
      .innerJoin(
        appointments,
        eq(prescriptions.appointmentId, appointments.appointmentId)
      )
      .where(eq(appointments.patientId, userId));

    res.json(result.map((r) => r.prescriptions));
  } catch (error) {
    console.error("Error in getPatientPrescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, userId));

    res.json(result);
  } catch (error) {
    console.error("Error in getDoctorPrescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const [created] = await db
      .insert(prescriptions)
      .values({
        ...req.body,
        doctorId: req.user.userId, // Ensure prescription is tied to the creating doctor
      })
      .returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error in createPrescription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const [updated] = await db
      .update(prescriptions)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(prescriptions.id, req.prescription.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updatePrescription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    await db
      .delete(prescriptions)
      .where(eq(prescriptions.id, req.prescription.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deletePrescription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
