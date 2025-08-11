import { Router } from "express";
import {
  createUserFeedbacks,
  deleteUserFeedbacks,
  getAllUserFeedbacks,
  getUserFeedbacks,
  getUserFeedbacksById,
  updateUserFeedbacks,
} from "../controllers/userFeedbacks.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateUserFeedbackFKs } from "../middlewares/userFeedbacks/fkValidation.middleware.js";
import {
  checkUserFeedbackOwnership,
  checkUserFeedbacksAccess,
} from "../middlewares/userFeedbacks/ownershipCheck.middleware.js";
import {
  restrictUserFeedbackModification,
  validateUserFeedbackCreation,
} from "../middlewares/userFeedbacks/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { userFeedbackSchema } from "../validators/userFeedbacksSchema.js";

const userFeedbacksRouter = Router();

// Admin routes
userFeedbacksRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllUserFeedbacks
);

// User routes
userFeedbacksRouter.get(
  "/user",
  authenticateToken,
  checkUserFeedbacksAccess,
  getUserFeedbacks
);

userFeedbacksRouter.post(
  "/",
  authenticateToken,
  validateBody(userFeedbackSchema),
  validateUserFeedbackFKs,
  validateUserFeedbackCreation,
  createUserFeedbacks
);

// Shared routes
userFeedbacksRouter.get(
  "/:id",
  authenticateToken,
  checkUserFeedbackOwnership,
  getUserFeedbacksById
);

userFeedbacksRouter.put(
  "/:id",
  authenticateToken,
  checkUserFeedbackOwnership,
  restrictUserFeedbackModification,
  validateBody(userFeedbackSchema.partial()),
  validateUserFeedbackFKs,
  updateUserFeedbacks
);

userFeedbacksRouter.delete(
  "/:id",
  authenticateToken,
  checkUserFeedbackOwnership,
  restrictUserFeedbackModification,
  deleteUserFeedbacks
);

export default userFeedbacksRouter;
