import { eq, or } from "drizzle-orm";
import { db } from "../../config/db.js";
import { medications } from "../../db/schema.js";

/**
 * Middleware to ensure medication ownership or authorized access
 * Allows:
 * - Patients to access their own medications
 * - Doctors to access medications they prescribed
 * - Admins to access any medication
 */
export async function ensureMedicationOwnership(req, res, next) {
  try {
    const { id: medicationId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!medicationId || medicationId === 'undefined' || medicationId === 'null') {
      return res.status(400).json({
        success: false,
        error: "Valid medication ID is required",
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(medicationId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid medication ID format",
      });
    }

    // Admin has access to everything
    if (user.role === "admin") {
      return next();
    }

    // Find the medication
    const [medication] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, medicationId));

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: "Medication not found",
      });
    }

    // Check ownership/access rights
    const hasAccess = 
      // Patient can access their own medications
      (user.role === "patient" && medication.patientId === user.userId) ||
      // Doctor can access medications they prescribed
      (user.role === "doctor" && medication.prescribedBy === user.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You don't have permission to access this medication",
      });
    }

    // Attach medication to request for use in controller
    req.medication = medication;
    next();
  } catch (error) {
    console.error("Error in medication ownership middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authorization",
    });
  }
}

/**
 * Middleware to ensure patient ownership for patient-specific routes
 * Used for routes like GET /medications/:patientId
 */
export async function ensurePatientAccess(req, res, next) {
  try {
    const { patientId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!patientId || patientId === 'undefined' || patientId === 'null') {
      return res.status(400).json({
        success: false,
        error: "Valid patient ID is required",
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid patient ID format",
      });
    }

    // Admin has access to everything
    if (user.role === "admin") {
      return next();
    }

    // Patient can only access their own data
    if (user.role === "patient" && user.userId !== patientId) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own medications",
      });
    }

    // For doctors, we'll check if they have prescribed medications for this patient
    // This is more permissive - doctors can see medications for any patient they've treated
    if (user.role === "doctor") {
      const doctorMedications = await db
        .select()
        .from(medications)
        .where(
          or(
            eq(medications.patientId, patientId),
            eq(medications.prescribedBy, user.userId)
          )
        );

      // If doctor has prescribed any medication for this patient, allow access
      const hasAccess = doctorMedications.some(
        med => med.prescribedBy === user.userId && med.patientId === patientId
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "Access denied. You can only access medications for patients you've treated",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error in patient access middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authorization",
    });
  }
}
