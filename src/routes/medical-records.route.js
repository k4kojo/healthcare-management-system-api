import { Router } from "express";
import {
  createMedicalRecords,
  deleteMedicalRecords,
  getMedicalRecordsById,
  getMedicalRecordsByPatientId,
  updateMedicalRecords,
} from "../controllers/medicalRecords.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateMedicalRecordFKs } from "../middlewares/medicalRecords/fkValidation.middleware.js";
import {
  checkMedicalRecordOwnership,
  checkPatientAccess,
} from "../middlewares/medicalRecords/ownershipCheck.middleware.js";
import {
  preventPatientModification,
  validateDoctorPatientRelationship,
} from "../middlewares/medicalRecords/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { medicalRecordSchema } from "../validators/medicalRecordsSchema.js";

const medicalRecordsRouter = Router();

medicalRecordsRouter.get(
  "/patients/:patientId/medical-records",
  authenticateToken,
  checkPatientAccess,
  getMedicalRecordsByPatientId
);

medicalRecordsRouter.get(
  "/medical-records/:id",
  authenticateToken,
  checkMedicalRecordOwnership,
  getMedicalRecordsById
);

medicalRecordsRouter.post(
  "/patients/:patientId/medical-records",
  authenticateToken,
  preventPatientModification,
  validateBody(medicalRecordSchema),
  validateMedicalRecordFKs,
  validateDoctorPatientRelationship,
  createMedicalRecords
);

medicalRecordsRouter.put(
  "/medical-records/:id",
  authenticateToken,
  checkMedicalRecordOwnership,
  preventPatientModification,
  validateBody(medicalRecordSchema.partial()),
  validateMedicalRecordFKs,
  updateMedicalRecords
);

medicalRecordsRouter.delete(
  "/medical-records/:id",
  authenticateToken,
  checkMedicalRecordOwnership,
  preventPatientModification,
  deleteMedicalRecords
);

export default medicalRecordsRouter;
