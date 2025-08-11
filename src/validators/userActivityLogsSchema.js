import { z } from "zod";

const activityTypes = [
  "login",
  "logout",
  "profile_update",
  "password_change",
  "appointment_booked",
  "appointment_cancelled",
  "prescription_viewed",
  "payment_made",
];

export const userActivityLogSchema = z.object({
  userId: z.string().uuid(),
  activityType: z.enum(activityTypes),
  activityDetails: z
    .string()
    .max(1000, "Activity details cannot exceed 1000 characters")
    .optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
  userAgent: z.string().max(255).optional(),
});

export const userActivityLogUpdateSchema = userActivityLogSchema.partial();
