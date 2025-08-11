import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatRooms as chatRoomsTable, videoCalls } from "../schema.js";

export async function seedVideoCalls(users, chatRooms, appointments) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (chatRooms.length === 0 || appointments.length === 0) {
    throw new Error("Need chat rooms and appointments for video calls");
  }

  // Handle both object formats
  const roomId = chatRooms[0].id || chatRooms[0].chatRoomId;

  const callData = [
    {
      id: "4fa85f64-5717-4562-b3fc-2c963f66afa6",
      chatRoomId: roomId,
      appointmentId: appointments[0].appointmentId,
      patientId: patients[0].userId,
      doctorId: doctors[0].userId,
      roomSid: "RMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      statusCallbackUrl: "https://example.com/webhook",
      status: "completed",
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3300000),
      duration: 55 * 60,
      participants: JSON.stringify([patients[0].userId, doctors[0].userId]),
    },
  ];

  const insertedCalls = await db
    .insert(videoCalls)
    .values(callData)
    .returning();

  // Update chat rooms
  await db
    .update(chatRoomsTable)
    .set({
      hasActiveCall: true,
      currentCallId: insertedCalls[0].id,
    })
    .where(eq(chatRoomsTable.chatRoomId, roomId));

  console.log(`📹 Seeded ${insertedCalls.length} video calls`);
  return insertedCalls;
}
