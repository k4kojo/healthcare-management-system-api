// appointment.route.js
import { Router } from "express";
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
} from "../controllers/appointments.controller.js";
import { validateAppointmentAccess } from "../middlewares/appointments/appointmentAccess.middleware.js";
import { checkAppointmentOwnership } from "../middlewares/appointments/appointmentOwnership.middleware.js";
import { validateDoctorExists } from "../middlewares/appointments/doctorExists.middleware.js";
import { validatePatientExists } from "../middlewares/appointments/patientExists.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const appointmentRouter = Router();

appointmentRouter.use(authenticateToken);

appointmentRouter.get(
  "/",
  validateAppointmentAccess(["admin", "doctor", "patient"]),
  getAllAppointments
);

appointmentRouter.get("/:id", checkAppointmentOwnership, getAppointmentById);

appointmentRouter.post(
  "/",
  validateAppointmentAccess(["patient", "admin"]), // Allow admin to create appointments
  validateDoctorExists,
  validatePatientExists, // Only used when admin creates appointment
  createAppointment
);

appointmentRouter.put(
  "/:id",
  checkAppointmentOwnership,
  validateAppointmentAccess(["admin", "doctor"]),
  updateAppointment
);

appointmentRouter.delete(
  "/:id",
  checkAppointmentOwnership,
  validateAppointmentAccess(["admin", "doctor"]),
  deleteAppointment
);

export default appointmentRouter;
