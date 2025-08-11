import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { userFeedback } from "../db/schema/userFeedback.js";

export const getAllUserFeedbacks = async (req, res) => {
  try {
    const result = await db.select().from(userFeedback);
    res.json(result);
  } catch (error) {
    console.error("Error in getAllUserFeedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserFeedbacks = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.userId, req.user.userId));
    res.json(result);
  } catch (error) {
    console.error("Error in getUserFeedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserFeedbacksById = async (req, res) => {
  try {
    res.json(req.userFeedback); // Already fetched by middleware
  } catch (error) {
    console.error("Error in getUserFeedbacksById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUserFeedbacks = async (req, res) => {
  try {
    const [record] = await db
      .insert(userFeedback)
      .values({
        ...req.body,
        userId: req.user.userId, // Ensure feedback is tied to the creating user
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createUserFeedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserFeedbacks = async (req, res) => {
  try {
    const [updated] = await db
      .update(userFeedback)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(userFeedback.id, req.userFeedback.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateUserFeedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUserFeedbacks = async (req, res) => {
  try {
    await db
      .delete(userFeedback)
      .where(eq(userFeedback.id, req.userFeedback.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUserFeedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
