import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatRooms } from "../schema.js";

export async function seedChatRooms(users) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (doctors.length === 0 || patients.length === 0) {
    throw new Error("Need at least one doctor and one patient for chat rooms");
  }

  const roomData = patients.map((p) => ({
    chatRoomId: crypto.randomUUID(),
    patientId: p.userId,
    doctorId: doctors[Math.floor(Math.random() * doctors.length)].userId,
    createdAt: sql`now()`,
    updatedAt: sql`now()`,
  }));

  const insertedRooms = await db.insert(chatRooms).values(roomData).returning();
  console.log(`💬 Seeded ${insertedRooms.length} chat rooms`);
  return insertedRooms;
}
