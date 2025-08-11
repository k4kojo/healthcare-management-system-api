import { db } from "../../../config/db.js";
import { notifications } from "../../../db/schema.js";

export default {
  async create({ userId, title, body, type, metadata = {} }) {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          userId,
          title,
          body,
          type,
          isRead: false,
          metadata: JSON.stringify(metadata),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log("In-app notification created:", notification.id);
      return notification;
    } catch (error) {
      log("In-app notification failed:", error);
      throw error;
    }
  },

  async markAsRead(notificationId) {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.id, notificationId));
  },
};
