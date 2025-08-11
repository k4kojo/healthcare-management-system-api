import { z } from "zod";

export const chatMessageSchema = z.object({
  chatRoomId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1),
  isRead: z.boolean().optional(),
  messageType: z.enum(["text", "file"]).optional(),
  fileUrl: z.string().url().optional(),
  replyTo: z.string().uuid().nullable().optional(),
  replyMessageType: z.enum(["text", "file"]).nullable().optional(),
  replyFileUrl: z.string().url().nullable().optional(),
  replyContent: z.string().nullable().optional(),
});

export const chatMessageUpdateSchema = chatMessageSchema.partial();
