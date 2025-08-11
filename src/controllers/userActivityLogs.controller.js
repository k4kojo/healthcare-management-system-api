import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { userActivityLogs } from "../db/schema/userActivityLogs.js";

export const getAllUserActivityLogs = async (req, res) => {
  try {
    const result = await db.select().from(userActivityLogs);
    res.json(result);
  } catch (error) {
    console.error("Error in getAllUserActivityLogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserActivityLogs = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(userActivityLogs)
      .where(eq(userActivityLogs.userId, req.user.userId));
    res.json(result);
  } catch (error) {
    console.error("Error in getUserActivityLogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserActivityLogsById = async (req, res) => {
  try {
    res.json(req.userActivityLog); // Already fetched by middleware
  } catch (error) {
    console.error("Error in getUserActivityLogsById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUserActivityLogs = async (req, res) => {
  try {
    const [created] = await db
      .insert(userActivityLogs)
      .values({
        ...req.body,
        // Default to current user if not specified
        userId: req.body.userId || req.user.userId,
      })
      .returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error in createUserActivityLogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserActivityLogs = async (req, res) => {
  try {
    const [updated] = await db
      .update(userActivityLogs)
      .set(req.body)
      .where(eq(userActivityLogs.id, req.userActivityLog.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateUserActivityLogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUserActivityLogs = async (req, res) => {
  try {
    await db
      .delete(userActivityLogs)
      .where(eq(userActivityLogs.id, req.userActivityLog.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUserActivityLogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
