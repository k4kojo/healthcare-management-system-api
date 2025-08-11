import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import { users } from "../schema.js";

export async function seedUsers() {
  const password = await hash("Test@123", 10);

  const userData = [
    // Admin
    {
      userId: uuidv4(),
      firstName: "Admin",
      lastName: "User",
      email: "admin@healthcare.com",
      password,
      phoneNumber: "+1234567890",
      dateOfBirth: new Date(1980, 0, 1),
      role: "admin",
      isVerified: true,
      isActive: true,
    },
    // Doctor
    {
      userId: uuidv4(),
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah.smith@doctor.com",
      password,
      phoneNumber: "+1122334455",
      dateOfBirth: new Date(1985, 5, 15),
      role: "doctor",
      isVerified: true,
      isActive: true,
    },
    // Patients
    {
      userId: uuidv4(),
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@patient.com",
      password,
      phoneNumber: "+1987654321",
      dateOfBirth: new Date(1990, 10, 20),
      role: "patient",
      isVerified: true,
      isActive: true,
    },
    {
      userId: uuidv4(),
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@patient.com",
      password,
      phoneNumber: "+1654321987",
      dateOfBirth: new Date(1995, 3, 5),
      role: "patient",
      isVerified: true,
      isActive: true,
    },
  ];

  const insertedUsers = await db.insert(users).values(userData).returning();

  console.log(`👥 Seeded ${insertedUsers.length} users`);
  return insertedUsers;
}
