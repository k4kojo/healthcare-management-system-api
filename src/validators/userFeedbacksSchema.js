import { z } from "zod";

const feedbackCategories = [
  "app",
  "support",
  "doctor",
  "feature_request",
  "bug_report",
  "ui_ux",
];

export const userFeedbackSchema = z.object({
  feedback: z
    .string()
    .min(1, "Feedback cannot be empty")
    .max(1000, "Feedback cannot exceed 1000 characters"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .refine((val) => Number(val.toFixed(1)) === val, {
      message: "Rating can have at most one decimal place",
    }),
  category: z.enum(feedbackCategories).optional(),
  metadata: z.record(z.any()).optional(), // For additional context
});

export const userFeedbackUpdateSchema = userFeedbackSchema.partial();
