import { desc, eq, or } from "drizzle-orm";
import { db } from "../config/db.js";
import { notifications } from "../db/schema/notifications.js";

export const getAllNotifications = async (req, res) => {
  try {
    const result = await db.select().from(notifications);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(notifications)
      .where(
        or(
          eq(notifications.userId, req.user.userId),
          eq(notifications.isGlobal, true)
        )
      )
      .orderBy(desc(notifications.createdAt));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotificationsById = async (req, res) => {
  try {
    res.json(req.notification); // Already fetched by middleware
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createNotifications = async (req, res) => {
  try {
    const [record] = await db
      .insert(notifications)
      .values({
        ...req.body,
        // Ensure system notifications are marked correctly
        isGlobal: req.body.isGlobal || req.body.userId === null,
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateNotifications = async (req, res) => {
  try {
    // Only allow updating isRead for non-admins
    const updateData =
      req.user.role === "admin" ? req.body : { isRead: req.body.isRead };

    const [updated] = await db
      .update(notifications)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, req.notification.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const [updated] = await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, req.notification.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(
        or(
          eq(notifications.userId, req.user.userId),
          eq(notifications.isGlobal, true)
        )
      )
      .returning();
    res.json({ message: `Marked ${result.length} notifications as read`, updated: result.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    await db
      .delete(notifications)
      .where(eq(notifications.id, req.notification.id));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
