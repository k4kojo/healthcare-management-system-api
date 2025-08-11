import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { reviews } from "../../db/schema/reviews.js";

export const checkReviewOwnership = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const { userId, role } = req.user;

    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, Number(reviewId)));

    if (!review.length) {
      return res.status(404).json({ error: "Review not found" });
    }

    const isOwner =
      role === "admin" ||
      review[0].patientId === userId ||
      (role === "doctor" && review[0].doctorId === userId);

    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized access to review" });
    }

    req.review = review[0]; // Attach review to request for later use
    next();
  } catch (error) {
    console.error("Review ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkPatientReviewsAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Admins and doctors can access all reviews through their own routes
    if (role !== "patient") return next();

    // Ensure patients can only access their own reviews
    if (req.params.patientId && req.params.patientId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to reviews" });
    }

    next();
  } catch (error) {
    console.error("Patient reviews access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
