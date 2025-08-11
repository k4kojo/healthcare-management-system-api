import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(7),
  // Accept ISO/date strings from clients and coerce to Date
  dateOfBirth: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120); // Max age 120 years
      return date <= today && date >= minDate;
    },
    {
      message: "Date of birth must be a valid date (max age 120 years)",
    }
  ),
  role: z.enum(["admin", "doctor", "patient"]).optional().default("patient"),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
