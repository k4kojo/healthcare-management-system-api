// routes/doctor-profile.route.js
import { Router } from "express";
import {
  createDoctorProfile,
  deleteDoctorProfile,
  getAllDoctorProfile,
  getDoctorProfileById,
  updateDoctorProfile,
} from "../controllers/doctorProfile.controller.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateDoctorUser } from "../middlewares/doctor/doctorValidation.middleware.js";
import { verifyProfileOwnership } from "../middlewares/doctor/profileOwnership.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  doctorProfileSchema,
  doctorProfileUpdateSchema,
} from "../validators/doctorProfileSchema.js";

const doctorProfileRouter = Router();

// Apply authentication to all routes
doctorProfileRouter.use(authenticateToken);

doctorProfileRouter.get("/", authorizeRoles("admin", "doctor", "patient"), getAllDoctorProfile);

doctorProfileRouter.get("/:id", verifyProfileOwnership, getDoctorProfileById);

doctorProfileRouter.post(
  "/",
  authorizeRoles("doctor", "admin"),
  validateRequest(doctorProfileSchema),
  validateDoctorUser,
  createDoctorProfile
);

doctorProfileRouter.put(
  "/:id",
  verifyProfileOwnership,
  authorizeRoles("doctor", "admin"),
  validateRequest(doctorProfileUpdateSchema),
  updateDoctorProfile
);

doctorProfileRouter.delete(
  "/:id",
  authorizeRoles("admin"),
  verifyProfileOwnership,
  deleteDoctorProfile
);

export default doctorProfileRouter;
