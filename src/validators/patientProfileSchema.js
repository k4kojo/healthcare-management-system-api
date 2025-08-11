import { z } from "zod";

export const upsertPatientProfileSchema = z.object({
  nationalId: z.string().trim().max(100).optional().nullable(),
  username: z.string().trim().max(100).optional().nullable(),
  firstName: z.string().trim().max(120).optional(),
  lastName: z.string().trim().max(120).optional(),
  gender: z.string().trim().max(20).optional().nullable(),
  dateOfBirth: z.string().trim().max(30).optional().nullable(),
  phoneNumber: z.string().trim().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  province: z.string().trim().max(120).optional().nullable(),
  address: z.string().optional().nullable(),
});


