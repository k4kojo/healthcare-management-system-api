import { Router } from "express";
import {
  createNotifications,
  deleteNotifications,
  getAllNotifications,
  getNotificationsById,
  getUserNotifications,
  markAsRead,
  updateNotifications,
} from "../controllers/notifications.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateNotificationFKs } from "../middlewares/notifications/fkValidation.middleware.js";
import { checkNotificationOwnership } from "../middlewares/notifications/ownershipCheck.middleware.js";
import { validateNotificationCreation } from "../middlewares/notifications/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { notificationSchema } from "../validators/notificationsSchema.js";

const notificationsRouter = Router();

// Admin only routes
notificationsRouter.get(
  "/notifications",
  authenticateToken,
  authorizeRoles("admin"),
  getAllNotifications
);

notificationsRouter.post(
  "/notifications",
  authenticateToken,
  authorizeRoles("admin"),
  validateBody(notificationSchema),
  validateNotificationFKs,
  validateNotificationCreation,
  createNotifications
);

// User-specific routes
notificationsRouter.get(
  "/user/notifications",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  getUserNotifications
);

notificationsRouter.get(
  "/notifications/:id",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  checkNotificationOwnership,
  getNotificationsById
);

notificationsRouter.put(
  "/notifications/:id/read",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  checkNotificationOwnership,
  markAsRead
);

notificationsRouter.put(
  "/notifications/:id",
  authenticateToken,
  authorizeRoles("admin"),
  checkNotificationOwnership,
  validateBody(notificationSchema.partial()),
  validateNotificationFKs,
  updateNotifications
);

notificationsRouter.delete(
  "/notifications/:id",
  authenticateToken,
  authorizeRoles("admin"),
  checkNotificationOwnership,
  deleteNotifications
);

export default notificationsRouter;
