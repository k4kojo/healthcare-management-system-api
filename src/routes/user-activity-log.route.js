import { Router } from "express";
import {
  createUserActivityLogs,
  deleteUserActivityLogs,
  getAllUserActivityLogs,
  getUserActivityLogs,
  getUserActivityLogsById,
  updateUserActivityLogs,
} from "../controllers/userActivityLogs.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateUserActivityLogFKs } from "../middlewares/userActivityLogs/fkValidation.middleware.js";
import {
  checkUserActivityLogOwnership,
  checkUserActivityLogsAccess,
} from "../middlewares/userActivityLogs/ownershipCheck.middleware.js";
import {
  restrictUserActivityLogModification,
  validateUserActivityLogCreation,
} from "../middlewares/userActivityLogs/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { userActivityLogSchema } from "../validators/userActivityLogsSchema.js";

const userActivityLogsRouter = Router();

// Admin routes
userActivityLogsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllUserActivityLogs
);

// User routes
userActivityLogsRouter.get(
  "/user",
  authenticateToken,
  checkUserActivityLogsAccess,
  getUserActivityLogs
);

userActivityLogsRouter.post(
  "/",
  authenticateToken,
  validateBody(userActivityLogSchema),
  validateUserActivityLogFKs,
  validateUserActivityLogCreation,
  createUserActivityLogs
);

// Shared routes
userActivityLogsRouter.get(
  "/:id",
  authenticateToken,
  checkUserActivityLogOwnership,
  getUserActivityLogsById
);

userActivityLogsRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  checkUserActivityLogOwnership,
  restrictUserActivityLogModification,
  validateBody(userActivityLogSchema.partial()),
  updateUserActivityLogs
);

userActivityLogsRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  checkUserActivityLogOwnership,
  restrictUserActivityLogModification,
  deleteUserActivityLogs
);

export default userActivityLogsRouter;
