import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { userFeedback } from "../../db/schema/userFeedback.js";

export const checkUserFeedbackOwnership = async (req, res, next) => {
  try {
    const feedbackId = req.params.id;
    const { userId, role } = req.user;

    const feedback = await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.id, Number(feedbackId)));

    if (!feedback.length) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    const isOwner = role === "admin" || feedback[0].userId === userId;

    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized access to feedback" });
    }

    req.userFeedback = feedback[0]; // Attach feedback to request for later use
    next();
  } catch (error) {
    console.error("User Feedback ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkUserFeedbacksAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Admins can access all feedbacks
    if (role === "admin") return next();

    // Ensure regular users can only access their own feedbacks
    if (req.params.userId && req.params.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to feedbacks" });
    }

    next();
  } catch (error) {
    console.error("User Feedbacks access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
