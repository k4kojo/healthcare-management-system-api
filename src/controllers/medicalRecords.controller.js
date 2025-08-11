import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { medicalRecords } from "../db/schema/medicalRecords.js";

export const getMedicalRecordsByPatientId = async (req, res) => {
  try {
    const records = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, req.params.patientId));
    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMedicalRecordsById = async (req, res) => {
  try {
    res.json(req.medicalRecord); // Already fetched by middleware
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMedicalRecords = async (req, res) => {
  try {
    const [record] = await db
      .insert(medicalRecords)
      .values({
        ...req.body,
        doctorId: req.user.userId, // Set by middleware
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMedicalRecords = async (req, res) => {
  try {
    const [updated] = await db
      .update(medicalRecords)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, req.medicalRecord.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMedicalRecords = async (req, res) => {
  try {
    await db
      .delete(medicalRecords)
      .where(eq(medicalRecords.id, req.medicalRecord.id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
