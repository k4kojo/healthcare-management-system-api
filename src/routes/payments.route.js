import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getAllPayments,
  getPaymentById,
  getUserPayments,
  updatePayment,
} from "../controllers/payments.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validatePaymentFKs } from "../middlewares/payments/fkValidation.middleware.js";
import { checkPaymentOwnership } from "../middlewares/payments/ownershipCheck.middleware.js";
import {
  restrictPaymentModification,
  validatePaymentCreation,
} from "../middlewares/payments/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { paymentSchema } from "../validators/paymentSchema.js";

const paymentsRouter = Router();

// Admin routes
paymentsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllPayments
);

paymentsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  validateBody(paymentSchema),
  validatePaymentFKs,
  validatePaymentCreation,
  createPayment
);

paymentsRouter.put(
  "/:paymentId",
  authenticateToken,
  authorizeRoles("admin", "patient"),
  checkPaymentOwnership,
  restrictPaymentModification,
  validateBody(paymentSchema.partial()),
  updatePayment
);

paymentsRouter.delete(
  "/:paymentId",
  authenticateToken,
  authorizeRoles("admin"),
  checkPaymentOwnership,
  deletePayment
);

// User routes
paymentsRouter.get(
  "/user",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  getUserPayments
);

paymentsRouter.get(
  "/:paymentId",
  authenticateToken,
  authorizeRoles("admin", "doctor", "patient"),
  checkPaymentOwnership,
  getPaymentById
);

export default paymentsRouter;
