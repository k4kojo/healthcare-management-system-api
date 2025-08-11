import { Router } from "express";
import {
  createLabResults,
  deleteLabResults,
  getAllLabResults,
  getLabResultsById,
  updateLabResults,
} from "../controllers/labResults.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { verifyResultOwnership } from "../middlewares/lab/resultOwnership.middleware.js";
import { validateLabResultRelations } from "../middlewares/lab/resultValidation.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  labResultsSchema,
  labResultsUpdateSchema,
} from "../validators/labResultsSchema.js";

const labResultsRouter = Router();

// Apply authentication to all routes
labResultsRouter.use(authenticateToken);

labResultsRouter.get(
  "/",
  authorizeRoles(["admin", "doctor", "patient"]),
  getAllLabResults
);

labResultsRouter.get("/:id", verifyResultOwnership, getLabResultsById);

labResultsRouter.post(
  "/",
  authorizeRoles(["doctor", "admin"]),
  validateRequest(labResultsSchema),
  validateLabResultRelations,
  createLabResults
);

labResultsRouter.put(
  "/:id",
  verifyResultOwnership,
  authorizeRoles(["doctor", "admin"]),
  validateRequest(labResultsUpdateSchema),
  updateLabResults
);

labResultsRouter.delete(
  "/:id",
  authorizeRoles(["admin"]),
  verifyResultOwnership,
  deleteLabResults
);

export default labResultsRouter;
