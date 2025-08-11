import { z } from "zod";

export const doctorProfileSchema = z.object({
  doctorId: z.string().uuid().optional(),
  specialization: z
    .string()
    .min(2, "Specialization must be at least 2 characters"),
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  reviews: z.number().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  experienceYears: z
    .string()
    .max(50, "Experience must be less than 50 characters")
    .optional(),
});

export const doctorProfileUpdateSchema = doctorProfileSchema.partial().refine(
  (data) => {
    if (data.rating !== undefined) {
      return data.rating >= 0 && data.rating <= 5;
    }
    return true;
  },
  {
    message: "Rating must be between 0 and 5",
    path: ["rating"],
  }
);
