import { z } from "zod";

export const chatRoomSchema = z
  .object({
    chatRoomId: z.string().uuid({ message: "chatRoomId must be a valid UUID" }),
    patientId: z.string().uuid({ message: "patientId must be a valid UUID" }),
    doctorId: z.string().uuid({ message: "doctorId must be a valid UUID" }),
  })
  .refine((data) => data.doctorId !== data.patientId, {
    message: "Doctor and patient cannot be the same user",
    path: ["doctorId", "patientId"],
  });

export const chatRoomUpdateSchema = z
  .object({
    patientId: z
      .string()
      .uuid({ message: "patientId must be a valid UUID" })
      .optional(),
    doctorId: z
      .string()
      .uuid({ message: "doctorId must be a valid UUID" })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.doctorId && data.patientId) {
        return data.doctorId !== data.patientId;
      }
      return true;
    },
    {
      message: "Doctor and patient cannot be the same user",
      path: ["doctorId", "patientId"],
    }
  );
