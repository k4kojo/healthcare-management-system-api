import { Router } from "express";
import {
  createDoctorAvailability,
  deleteDoctorAvailability,
  getAllDoctorAvailability,
  getDoctorAvailabilityById,
  updateDoctorAvailability,
} from "../controllers/doctorAvailability.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { verifyAvailabilityOwnership } from "../middlewares/doctor/availabilityOwnership.middleware.js";
import { validateDoctorExists } from "../middlewares/doctor/availabilityValidation.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  doctorAvailabilitySchema,
  doctorAvailabilityUpdateSchema,
} from "../validators/doctorAvailabilitySchema.js";

const doctorAvailabilityRouter = Router();

// Apply authentication to all routes
doctorAvailabilityRouter.use(authenticateToken);

doctorAvailabilityRouter.get("/", getAllDoctorAvailability);

doctorAvailabilityRouter.get(
  "/:id",
  verifyAvailabilityOwnership,
  getDoctorAvailabilityById
);

doctorAvailabilityRouter.post(
  "/",
  authorizeRoles(["doctor", "admin"]),
  validateRequest(doctorAvailabilitySchema),
  validateDoctorExists,
  createDoctorAvailability
);

doctorAvailabilityRouter.put(
  "/:id",
  verifyAvailabilityOwnership,
  authorizeRoles(["doctor", "admin"]),
  validateRequest(doctorAvailabilityUpdateSchema),
  updateDoctorAvailability
);

doctorAvailabilityRouter.delete(
  "/:id",
  verifyAvailabilityOwnership,
  authorizeRoles(["doctor", "admin"]),
  deleteDoctorAvailability
);

export default doctorAvailabilityRouter;
