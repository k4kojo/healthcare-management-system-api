import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { chatRooms } from "../schema.js";

export async function seedChatRooms(users) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (doctors.length === 0 || patients.length < 2) {
    throw new Error("Need at least one doctor and two patients for chat rooms");
  }

  // FIX: Use camelCase properties to match the Drizzle schema
  const roomData = [
    {
      chatRoomId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      patientId: patients[0].userId,
      doctorId: doctors[0].userId,
      createdAt: sql`now()`, // Also likely needs to be camelCase
      updatedAt: sql`now()`, // Also likely needs to be camelCase
    },
    {
      chatRoomId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      patientId: patients[1].userId,
      doctorId: doctors[0].userId,
      createdAt: sql`now()`,
      updatedAt: sql`now()`,
    },
  ];

  try {
    const insertedRooms = await db
      .insert(chatRooms)
      .values(roomData)
      .returning();

    console.log(`💬 Seeded ${insertedRooms.length} chat rooms`);
    return insertedRooms;
  } catch (error) {
    console.error("❌ Error seeding chat rooms:", error);
    throw error;
  }
}
