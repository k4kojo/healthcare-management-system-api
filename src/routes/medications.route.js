import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requireDoctor, requireDoctorOrPatient, requirePatient } from "../middlewares/medications/requireRole.middleware.js";
import { 
  ensureMedicationOwnership, 
  ensurePatientAccess 
} from "../middlewares/medications/medicationOwnership.middleware.js";
import { validateRequest, validateQuery } from "../middlewares/validate.middleware.js";
import {
  createMedicationSchema,
  updateMedicationSchema,
  logMedicationSchema,
  medicationQuerySchema,
  medicationLogsQuerySchema,
} from "../validators/medicationsSchema.js";
import {
  createMedication,
  getMedicationsByPatient,
  getMedicationById,
  updateMedication,
  logMedicationIntake,
  getMedicationLogs,
  getMedicationReminders,
  getMedicationAdherence,
  deleteMedication,
} from "../controllers/medications.controller.js";

const medicationsRouter = Router();

// All routes require authentication
medicationsRouter.use(authenticateToken);

/**
 * @route   POST /api/v0/medications
 * @desc    Create a new medication (Doctor only)
 * @access  Doctor, Admin
 */
medicationsRouter.post(
  "/",
  requireDoctor,
  validateRequest(createMedicationSchema),
  createMedication
);

/**
 * @route   GET /api/v0/medications/:patientId
 * @desc    Get all medications for a patient
 * @access  Patient (own), Doctor (prescribed), Admin
 */
medicationsRouter.get(
  "/:patientId",
  ensurePatientAccess,
  validateQuery(medicationQuerySchema),
  getMedicationsByPatient
);

/**
 * @route   GET /api/v0/medications/details/:id
 * @desc    Get a single medication by ID
 * @access  Patient (own), Doctor (prescribed), Admin
 */
medicationsRouter.get(
  "/details/:id",
  ensureMedicationOwnership,
  getMedicationById
);

/**
 * @route   PUT /api/v0/medications/:id
 * @desc    Update a medication
 * @access  Doctor (prescribed), Admin
 */
medicationsRouter.put(
  "/:id",
  requireDoctor,
  ensureMedicationOwnership,
  validateRequest(updateMedicationSchema),
  updateMedication
);

/**
 * @route   DELETE /api/v0/medications/:id
 * @desc    Delete a medication
 * @access  Doctor (prescribed), Admin
 */
medicationsRouter.delete(
  "/:id",
  requireDoctor,
  ensureMedicationOwnership,
  deleteMedication
);

/**
 * @route   POST /api/v0/medications/:id/logs
 * @desc    Log medication intake (Patient only)
 * @access  Patient (own medication)
 */
medicationsRouter.post(
  "/:id/logs",
  requirePatient,
  ensureMedicationOwnership,
  validateRequest(logMedicationSchema),
  logMedicationIntake
);

/**
 * @route   GET /api/v0/medications/:id/logs
 * @desc    Get medication logs
 * @access  Patient (own), Doctor (prescribed), Admin
 */
medicationsRouter.get(
  "/:id/logs",
  ensureMedicationOwnership,
  validateQuery(medicationLogsQuerySchema),
  getMedicationLogs
);

/**
 * @route   GET /api/v0/medications/:id/reminders
 * @desc    Get medication reminders
 * @access  Patient (own), Doctor (prescribed), Admin
 */
medicationsRouter.get(
  "/:id/reminders",
  ensureMedicationOwnership,
  getMedicationReminders
);

/**
 * @route   GET /api/v0/medications/:id/adherence
 * @desc    Get medication adherence statistics
 * @access  Patient (own), Doctor (prescribed), Admin
 */
medicationsRouter.get(
  "/:id/adherence",
  ensureMedicationOwnership,
  getMedicationAdherence
);

export default medicationsRouter;
