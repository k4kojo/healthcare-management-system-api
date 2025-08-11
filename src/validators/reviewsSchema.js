import { z } from "zod";

export const reviewSchema = z
  .object({
    doctorId: z.string().uuid(),
    appointmentId: z.string().uuid().optional(),
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5")
      .refine((val) => Number(val.toFixed(1)) === val, {
        message: "Rating can have at most one decimal place",
      }),
    comment: z
      .string()
      .max(500, "Comment cannot exceed 500 characters")
      .optional(),
  })
  .refine((data) => !data.appointmentId || data.doctorId, {
    message: "Doctor ID must be provided if appointment ID is provided",
  });

export const reviewUpdateSchema = reviewSchema.partial();
