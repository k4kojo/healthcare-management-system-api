import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { medicalRecords } from "../../db/schema/medicalRecords.js";

export const checkMedicalRecordOwnership = async (req, res, next) => {
  try {
    const recordId = req.params.id || req.params.recordId;
    const { userId, role } = req.user;

    const record = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, Number(recordId)));

    if (!record.length) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    const isOwner =
      role === "admin" ||
      (role === "doctor" && record[0].doctorId === userId) ||
      (role === "patient" && record[0].patientId === userId);

    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to medical record" });
    }

    req.medicalRecord = record[0]; // Attach record to request for later use
    next();
  } catch (error) {
    console.error("Ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkPatientAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const patientId = req.params.patientId;

    if (role === "patient" && userId !== patientId) {
      return res
        .status(403)
        .json({ error: "Patients can only access their own records" });
    }

    // Additional check if doctor is trying to access records
    if (role === "doctor") {
      const hasPatient = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.patientId, patientId))
        .where(eq(medicalRecords.doctorId, userId))
        .limit(1);

      if (!hasPatient.length) {
        return res
          .status(403)
          .json({ error: "Doctor can only access records of their patients" });
      }
    }

    next();
  } catch (error) {
    console.error("Patient access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
