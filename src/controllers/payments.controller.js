import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/db.js";
import { payments } from "../db/schema/payments.js";

const log = (controllerName, step, message) => {
  console.log(`[${controllerName}] - ${step}: ${message}`);
};

export const getAllPayments = async (req, res) => {
  const controllerName = "getAllPayments";
  log(controllerName, "Start", "Fetching all payments.");
  try {
    const result = await db.select().from(payments);
    log(controllerName, "Success", `Found ${result.length} payments.`);
    res.json(result);
  } catch (error) {
    log(controllerName, "Error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPayments = async (req, res) => {
  const controllerName = "getUserPayments";
  log(controllerName, "Start", "Fetching user payments.");
  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, req.user.userId));
    log(controllerName, "Success", `Found ${result.length} payments.`);
    res.json(result);
  } catch (error) {
    log(controllerName, "Error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPaymentById = async (req, res) => {
  const controllerName = "getPaymentById";
  log(controllerName, "Start", `Fetching payment ${req.params.paymentId}`);
  try {
    res.json(req.payment); // Already fetched by middleware
  } catch (error) {
    log(controllerName, "Error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPayment = async (req, res) => {
  const controllerName = "createPayment";
  log(controllerName, "Start", "Creating payment", {
    body: req.body,
    user: req.user,
  });

  try {
    // Validate required fields
    if (
      !req.body.appointmentId ||
      !req.body.userId ||
      !req.body.amount ||
      !req.body.method
    ) {
      log(controllerName, "Validation", "Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure patient can't set status to anything other than pending
    const status =
      req.user.role === "admin" ? req.body.status || "pending" : "pending";

    const paymentId = uuidv4();
    const paymentData = {
      paymentId,
      appointmentId: req.body.appointmentId,
      userId: req.body.userId,
      amount: req.body.amount,
      method: req.body.method,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [payment] = await db.insert(payments).values(paymentData).returning();

    if (!payment) {
      log(controllerName, "Error", "Payment creation failed");
      return res.status(500).json({ error: "Payment creation failed" });
    }

    log(
      controllerName,
      "Success",
      `Created payment with id: ${payment.paymentId}`,
      payment
    );
    res.status(201).json({
      paymentId: payment.paymentId,
      appointmentId: payment.appointmentId,
      userId: payment.userId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    log(controllerName, "Error", error.message, { stack: error.stack });

    if (error.code === "23505") {
      // Unique violation
      return res.status(409).json({ error: "Payment already exists" });
    }
    if (error.code === "23503") {
      // Foreign key violation
      return res
        .status(400)
        .json({ error: "Invalid appointment or user reference" });
    }

    res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
};

export const updatePayment = async (req, res) => {
  const controllerName = "updatePayment";
  const { paymentId } = req.params;
  log(controllerName, "Start", `Updating payment ${paymentId}`);

  try {
    // Filter updates based on role
    const updates =
      req.user.role === "admin"
        ? req.body
        : {
            method: req.body.method,
            providerRef: req.body.providerRef,
          };

    const [updated] = await db
      .update(payments)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(payments.paymentId, paymentId))
      .returning();

    log(controllerName, "Success", `Updated payment ${paymentId}`);
    res.json(updated);
  } catch (error) {
    log(controllerName, "Error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePayment = async (req, res) => {
  const controllerName = "deletePayment";
  const { paymentId } = req.params;
  log(controllerName, "Start", `Deleting payment ${paymentId}`);

  try {
    await db.delete(payments).where(eq(payments.paymentId, paymentId));

    log(controllerName, "Success", `Deleted payment ${paymentId}`);
    res.status(204).send();
  } catch (error) {
    log(controllerName, "Error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
