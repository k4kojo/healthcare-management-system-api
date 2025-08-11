import { z } from "zod";

const paymentStatuses = ["pending", "completed", "failed", "refunded"];

const paymentMethods = [
  "Credit Card",
  "MTN MoMo",
  "Telecel Cash",
  "AirtelTigo Cash",
];

export const paymentSchema = z.object({
  appointmentId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().positive().max(1000000),
  status: z.enum(paymentStatuses).optional().default("pending"),
  method: z.enum(paymentMethods).optional().default("Credit Card"),
  providerRef: z.string().max(255).optional().nullable(),
  metadata: z.record(z.any()).optional(), // For additional payment data
});

export const paymentUpdateSchema = paymentSchema.partial();
