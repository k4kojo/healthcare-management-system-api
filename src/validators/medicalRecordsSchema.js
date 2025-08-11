import { z } from "zod";

export const medicalRecordSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  diagnosis: z.string().min(2),
  treatment: z.string().min(2),
  notes: z.string().optional(),
});
