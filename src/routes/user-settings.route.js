import { Router } from "express";
import {
  createUserSettings,
  deleteUserSettings,
  getAllUserSettings,
  getUserSettingsById,
  updateUserSettings,
} from "../controllers/userSettings.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateUserSettingsFKs } from "../middlewares/userSettings/fkValidation.middleware.js";
import { checkUserSettingsOwnership } from "../middlewares/userSettings/ownershipCheck.middleware.js";
import {
  restrictUserSettingsModification,
  validateUserSettingsCreation,
} from "../middlewares/userSettings/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { userSettingsSchema } from "../validators/userSettingsSchema.js";

const userSettingsRouter = Router();

// Admin routes
userSettingsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllUserSettings
);

// User routes
userSettingsRouter.get(
  "/:userId",
  authenticateToken,
  checkUserSettingsOwnership,
  getUserSettingsById
);

userSettingsRouter.post(
  "/",
  authenticateToken,
  validateBody(userSettingsSchema),
  validateUserSettingsFKs,
  validateUserSettingsCreation,
  createUserSettings
);

userSettingsRouter.put(
  "/:userId",
  authenticateToken,
  checkUserSettingsOwnership,
  restrictUserSettingsModification,
  validateBody(userSettingsSchema.partial()),
  validateUserSettingsFKs,
  updateUserSettings
);

userSettingsRouter.delete(
  "/:userId",
  authenticateToken,
  checkUserSettingsOwnership,
  restrictUserSettingsModification,
  deleteUserSettings
);

export default userSettingsRouter;
