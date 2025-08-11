import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { reviews } from "../db/schema/reviews.js";

export const getAllReviews = async (req, res) => {
  try {
    const result = await db.select().from(reviews);
    res.json(result);
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.doctorId, userId));
    res.json(result);
  } catch (error) {
    console.error("Error in getDoctorReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPatientReviews = async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.patientId, userId));
    res.json(result);
  } catch (error) {
    console.error("Error in getPatientReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getReviewsById = async (req, res) => {
  try {
    res.json(req.review); // Already fetched by middleware
  } catch (error) {
    console.error("Error in getReviewsById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createReviews = async (req, res) => {
  try {
    const [record] = await db
      .insert(reviews)
      .values({
        ...req.body,
        patientId: req.user.userId, // Ensure review is tied to the creating patient
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateReviews = async (req, res) => {
  try {
    const [updated] = await db
      .update(reviews)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, req.review.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReviews = async (req, res) => {
  try {
    await db.delete(reviews).where(eq(reviews.id, req.review.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
