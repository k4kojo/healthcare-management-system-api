import { db } from "../../config/db.js";
import { notifications } from "../schema.js";

export async function seedNotifications(users, appointments) {
  if (users.length === 0 || appointments.length === 0) {
    throw new Error("Need users and appointments for notifications");
  }

  const notificationData = [
    // Global notifications
    {
      type: "system",
      message: "System maintenance scheduled for tonight at 2 AM",
      isGlobal: true,
    },
    // User-specific notifications
    {
      userId: users[0].userId,
      type: "appointment",
      message: "Your appointment with Dr. Smith is coming up",
      isGlobal: false,
    },
    // Appointment-specific notifications
    {
      userId: appointments[0].patientId,
      type: "appointment",
      message: `Reminder: Your appointment is tomorrow at ${new Date(
        appointments[0].appointmentDate
      ).toLocaleTimeString()}`,
      isGlobal: false,
    },
  ];

  const insertedNotifications = await db
    .insert(notifications)
    .values(notificationData)
    .returning();

  console.log(`🔔 Seeded ${insertedNotifications.length} notifications`);
  return insertedNotifications;
}
