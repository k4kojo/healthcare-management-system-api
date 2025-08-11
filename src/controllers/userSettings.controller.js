import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { userSettings } from "../db/schema/userSettings.js";
import { userSettingsSchema } from "../validators/userSettingsSchema.js";

export const getAllUserSettings = async (req, res) => {
  try {
    const result = await db.select().from(userSettings);
    res.json(result);
  } catch (error) {
    console.error("Error in getAllUserSettings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserSettingsById = async (req, res) => {
  try {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, req.params.userId));

    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error in getUserSettingsById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUserSettings = async (req, res) => {
  try {
    const userId = req.body.userId || req.user.userId;
    const validation = userSettingsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const [record] = await db
      .insert(userSettings)
      .values({
        userId,
        ...validation.data,
      })
      .returning();

    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createUserSettings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const validation = userSettingsSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const [updated] = await db
      .update(userSettings)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, req.params.userId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error in updateUserSettings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUserSettings = async (req, res) => {
  try {
    const [deleted] = await db
      .delete(userSettings)
      .where(eq(userSettings.userId, req.params.userId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUserSettings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
