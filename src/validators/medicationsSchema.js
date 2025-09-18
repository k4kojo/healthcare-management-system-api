import { z } from "zod";

// Schema for creating a new medication
export const createMedicationSchema = z.object({
  patientId: z.string().uuid("Patient ID must be a valid UUID"),
  name: z.string().min(1, "Medication name is required").max(255, "Medication name too long"),
  dosage: z.string().min(1, "Dosage is required").max(100, "Dosage description too long"),
  frequency: z.string().min(1, "Frequency is required").max(100, "Frequency description too long"),
  startDate: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    {
      message: "Start date cannot be in the past",
    }
  ),
  endDate: z.coerce.date().optional().nullable(),
  instructions: z.string().max(1000, "Instructions too long").optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

// Schema for updating a medication
export const updateMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required").max(255, "Medication name too long").optional(),
  dosage: z.string().min(1, "Dosage is required").max(100, "Dosage description too long").optional(),
  frequency: z.string().min(1, "Frequency is required").max(100, "Frequency description too long").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  instructions: z.string().max(1000, "Instructions too long").optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

// Schema for logging medication intake
export const logMedicationSchema = z.object({
  status: z.enum(["taken", "skipped", "missed"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'taken', 'skipped', or 'missed'",
  }),
  takenAt: z.coerce.date().optional().default(() => new Date()),
  notes: z.string().max(500, "Notes too long").optional(),
});

// Schema for creating medication reminders
export const createReminderSchema = z.object({
  remindAt: z.coerce.date().refine(
    (date) => {
      return date > new Date();
    },
    {
      message: "Reminder time must be in the future",
    }
  ),
  message: z.string().max(500, "Message too long").optional(),
});

// Schema for bulk creating reminders
export const bulkCreateRemindersSchema = z.object({
  reminders: z.array(createReminderSchema).min(1, "At least one reminder is required"),
});

// Schema for query parameters
export const medicationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  isActive: z.enum(["true", "false"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Schema for medication logs query
export const medicationLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["taken", "skipped", "missed"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
