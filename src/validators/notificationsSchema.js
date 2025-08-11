import { z } from "zod";

const notificationTypes = [
  "appointment",
  "lab_result",
  "chat",
  "system",
  "payment",
  "reminder",
];

export const notificationSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  type: z.enum(notificationTypes),
  message: z.string().min(1).max(500),
  isRead: z.boolean().optional().default(false),
  isGlobal: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional(), // For additional data
});

export const markAsReadSchema = z.object({
  isRead: z.boolean(),
});
