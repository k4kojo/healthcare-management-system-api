import { z } from "zod";

const supportedLanguages = ["en", "fr", "es", "de", "sw"];

export const userSettingsSchema = z
  .object({
    notificationEnabled: z.boolean().optional(),
    darkMode: z.boolean().optional(),
    language: z.enum(supportedLanguages).optional(),
    timezone: z.string().optional(),
    emailNotifications: z
      .object({
        promotions: z.boolean().optional(),
        reminders: z.boolean().optional(),
        updates: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export const userSettingsUpdateSchema = userSettingsSchema.partial();
