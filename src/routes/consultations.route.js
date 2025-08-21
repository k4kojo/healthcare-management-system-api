import { Router } from "express";
import {
    cancelConsultation,
    createConsultation,
    deleteConsultation,
    endConsultation,
    getAllConsultations,
    getConsultationById,
    startConsultation,
    updateConsultation,
} from "../controllers/consultations.controller.js";
import {
    authenticateToken,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const consultationsRouter = Router();

// Apply authentication to all routes
consultationsRouter.use(authenticateToken);

// Get all consultations
consultationsRouter.get(
  "/",
  authorizeRoles("admin", "doctor", "patient"),
  getAllConsultations
);

// Get consultation by ID
consultationsRouter.get("/:id", getConsultationById);

// Create new consultation
consultationsRouter.post(
  "/",
  authorizeRoles("admin", "doctor", "patient"),
  createConsultation
);

// Update consultation
consultationsRouter.put(
  "/:id",
  authorizeRoles("admin", "doctor"),
  updateConsultation
);

// Delete consultation
consultationsRouter.delete(
  "/:id",
  authorizeRoles("admin", "doctor"),
  deleteConsultation
);

// Start consultation
consultationsRouter.post(
  "/:id/start",
  authorizeRoles("admin", "doctor"),
  startConsultation
);

// End consultation
consultationsRouter.post(
  "/:id/end",
  authorizeRoles("admin", "doctor"),
  endConsultation
);

// Cancel consultation
consultationsRouter.post(
  "/:id/cancel",
  authorizeRoles("admin", "doctor", "patient"),
  cancelConsultation
);

export default consultationsRouter;
