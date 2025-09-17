import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)");

const dayOfWeekSchema = z
  .string()
  .refine(
    (val) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(val),
    {
      message: "Invalid day of week",
    }
  );

// Flexible validation that accepts both frontend format and backend format
export const doctorAvailabilitySchema = z
  .object({
    // Frontend format
    doctorId: z.string().uuid().optional(),
    dayOfWeek: dayOfWeekSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    isAvailable: z.boolean().optional(),
    maxPatients: z.number().int().min(1).max(50).optional(),
    notes: z.string().optional(),
    // Backend format (for backward compatibility)
    availableFrom: z.string().datetime().optional(),
    availableTo: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // Validate time range if frontend format is used
      if (data.startTime && data.endTime) {
        const [startHour, startMin] = data.startTime.split(':').map(Number);
        const [endHour, endMin] = data.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      }
      
      // Validate timestamp range if backend format is used
      if (data.availableFrom && data.availableTo) {
        const from = new Date(data.availableFrom);
        const to = new Date(data.availableTo);
        return to > from;
      }
      
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const doctorAvailabilityUpdateSchema = doctorAvailabilitySchema.partial();
