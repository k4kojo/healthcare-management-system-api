import { z } from "zod";

export const createVideoCallSchema = z.object({
  chatRoomId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
});

export const updateCallStatusSchema = z.object({
  status: z.enum(["scheduled", "started", "ended", "failed"]),
});
