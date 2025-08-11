import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { notifications } from "../../db/schema/notifications.js";

export const checkNotificationOwnership = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const { userId, role } = req.user;

    const notification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, Number(notificationId)));

    if (!notification.length) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Admins can access any notification
    if (role === "admin") {
      req.notification = notification[0];
      return next();
    }

    // Users can only access their own notifications
    if (notification[0].userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to notification" });
    }

    req.notification = notification[0];
    next();
  } catch (error) {
    console.error("Notification ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkUserNotificationsAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Admins can access all notifications through the admin route
    if (role === "admin") return next();

    // Ensure regular users can only access their own notifications
    if (req.params.userId && req.params.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to notifications" });
    }

    next();
  } catch (error) {
    console.error("User notifications access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
