import { Router } from "express";
import {
  createPrescription,
  createAppointmentPrescription,
  createDirectPrescription,
  deletePrescription,
  getAllPrescriptions,
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

// Admin routes
prescriptionsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllPrescriptions
);

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

// Appointment prescription creation (with appointment requirement)
prescriptionsRouter.post(
  "/appointment",
  authenticateToken,
  authorizeRoles("doctor"),
  createAppointmentPrescription
);

// Direct prescription creation (without appointment requirement)
prescriptionsRouter.post(
  "/direct",
  authenticateToken,
  authorizeRoles("doctor"),
  createDirectPrescription
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
