import express from "express";
import {
  createReviews,
  deleteReviews,
  getAllReviews,
  getDoctorReviews,
  getPatientReviews,
  getReviewsById,
  updateReviews,
} from "../controllers/reviews.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateReviewFKs } from "../middlewares/reviews/fkValidation.middleware.js";
import {
  checkPatientReviewsAccess,
  checkReviewOwnership,
} from "../middlewares/reviews/ownershipCheck.middleware.js";
import {
  restrictReviewModification,
  validateReviewCreation,
} from "../middlewares/reviews/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { reviewSchema } from "../validators/reviewsSchema.js";

const reviewsRouter = express.Router();

// Admin routes
reviewsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllReviews
);

// Doctor routes
reviewsRouter.get(
  "/doctor",
  authenticateToken,
  authorizeRoles("doctor"),
  getDoctorReviews
);

// Patient routes
reviewsRouter.get(
  "/patient",
  authenticateToken,
  authorizeRoles("patient"),
  checkPatientReviewsAccess,
  getPatientReviews
);

reviewsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("patient"),
  validateBody(reviewSchema),
  validateReviewFKs,
  validateReviewCreation,
  createReviews
);

// Shared routes
reviewsRouter.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  checkReviewOwnership,
  getReviewsById
);

reviewsRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "patient"),
  checkReviewOwnership,
  restrictReviewModification,
  validateBody(reviewSchema.partial()),
  updateReviews
);

reviewsRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "patient"),
  checkReviewOwnership,
  restrictReviewModification,
  deleteReviews
);

export default reviewsRouter;
