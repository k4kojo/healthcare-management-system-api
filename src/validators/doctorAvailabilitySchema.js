import { z } from "zod";

const dateSchema = z
  .string()
  .datetime()
  .refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format",
    }
  );

export const doctorAvailabilitySchema = z
  .object({
    doctorId: z.string().uuid().optional(),
    availableFrom: dateSchema,
    availableTo: dateSchema,
  })
  .refine(
    (data) => {
      const from = new Date(data.availableFrom);
      const to = new Date(data.availableTo);
      return to > from;
    },
    {
      message: "End time must be after start time",
      path: ["availableTo"],
    }
  );

export const doctorAvailabilityUpdateSchema = doctorAvailabilitySchema
  .partial()
  .refine(
    (data) => {
      if (data.availableFrom && data.availableTo) {
        const from = new Date(data.availableFrom);
        const to = new Date(data.availableTo);
        return to > from;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["availableTo"],
    }
  );
