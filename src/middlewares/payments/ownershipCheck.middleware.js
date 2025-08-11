import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { payments } from "../../db/schema/payments.js";

export const checkPaymentOwnership = async (req, res, next) => {
  try {
    const paymentId = req.params.paymentId || req.params.id;
    const { userId, role } = req.user;

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentId, paymentId));

    if (!payment.length) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const isOwner = role === "admin" || payment[0].userId === userId;

    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized access to payment" });
    }

    req.payment = payment[0]; // Attach payment to request for later use
    next();
  } catch (error) {
    console.error("Payment ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkUserPaymentsAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Admins can access all payments
    if (role === "admin") return next();

    // Ensure regular users can only access their own payments
    if (req.params.userId && req.params.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to payments" });
    }

    next();
  } catch (error) {
    console.error("User payments access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
