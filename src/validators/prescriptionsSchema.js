import { z } from "zod";

const medicationRegex = /^[a-zA-Z0-9\s\-]+$/;
const dosageRegex = /^[\d\.]+\s*[a-zA-Z]+$/;

export const prescriptionSchema = z
  .object({
    appointmentId: z.string().uuid(),
    medication: z
      .string()
      .min(1)
      .max(100)
      .regex(medicationRegex, "Invalid medication name"),
    dosage: z
      .string()
      .min(1)
      .max(20)
      .regex(dosageRegex, "Invalid dosage format (e.g. '500mg')"),
    frequency: z.string().min(1).max(50),
    startDate: z.coerce
      .date()
      .min(new Date(2000, 0, 1), "Date too far in past"),
    endDate: z.coerce.date().min(new Date(2000, 0, 1), "Date too far in past"),
    instructions: z.string().max(500).optional(),
    fileUrl: z.string().url().max(255).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const prescriptionUpdateSchema = prescriptionSchema.partial();
