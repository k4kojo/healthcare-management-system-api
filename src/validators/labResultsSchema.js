import { z } from "zod";

export const labResultsSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  doctorId: z.string().uuid("Invalid doctor ID format").optional(),
  appointmentId: z.string().uuid("Invalid appointment ID format"),
  testName: z.string().min(1, "Test name is required"),
  result: z.string().min(1, "Result is required"),
  resultDate: z.string().datetime("Invalid date format"),
  notes: z.string().max(1000, "Notes too long").optional(),
  fileUrl: z.string().url("Invalid URL format").optional(),
});

export const labResultsUpdateSchema = labResultsSchema.partial().refine(
  (data) => {
    if (data.resultDate) {
      return new Date(data.resultDate) <= new Date();
    }
    return true;
  },
  {
    message: "Result date cannot be in the future",
    path: ["resultDate"],
  }
);
