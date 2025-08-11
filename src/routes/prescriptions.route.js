import { Router } from "express";
import {
  createPrescription,
  deletePrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  updatePrescription,
} from "../controllers/prescriptions.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validatePrescriptionFKs } from "../middlewares/prescriptions/fkValidation.middleware.js";
import {
  checkPatientPrescriptionsAccess,
  checkPrescriptionOwnership,
} from "../middlewares/prescriptions/ownershipCheck.middleware.js";
import {
  restrictPrescriptionModification,
  validatePrescriptionCreation,
} from "../middlewares/prescriptions/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { prescriptionSchema } from "../validators/prescriptionsSchema.js";

const prescriptionsRouter = Router();

// Patient routes
prescriptionsRouter.get(
  "/patient",
  authenticateToken,
  authorizeRoles("patient"),
  checkPatientPrescriptionsAccess,
  getPatientPrescriptions
);

// Doctor routes
prescriptionsRouter.get(
  "/doctor",
  authenticateToken,
  authorizeRoles("doctor"),
  getDoctorPrescriptions
);

prescriptionsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("doctor"),
  validateBody(prescriptionSchema),
  validatePrescriptionFKs,
  validatePrescriptionCreation,
  createPrescription
);

// Shared routes
prescriptionsRouter.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  checkPrescriptionOwnership,
  getPrescriptionById
);

prescriptionsRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "doctor"),
  checkPrescriptionOwnership,
  restrictPrescriptionModification,
  validateBody(prescriptionSchema.partial()),
  updatePrescription
);

prescriptionsRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "doctor"),
  checkPrescriptionOwnership,
  restrictPrescriptionModification,
  deletePrescription
);

export default prescriptionsRouter;
