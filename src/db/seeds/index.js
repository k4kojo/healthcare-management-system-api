import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { seedAppointments } from "./appointments.seed.js";
import { seedChatMessages } from "./chatMessages.seed.js";
import { seedChatRooms } from "./chatRooms.seed.js";
import { seedDoctorAvailability } from "./doctorAvailability.seed.js";
import { seedDoctorProfiles } from "./doctorProfiles.seed.js";
import { seedLabResults } from "./labResults.seed.js";
import { seedMedicalRecords } from "./medicalRecords.seed.js";
import { seedNotifications } from "./notifications.seed.js";
import { seedPayments } from "./payments.seed.js";
import { seedPrescriptions } from "./prescriptions.seed.js";
import { seedReviews } from "./reviews.seed.js";
import { seedUserActivityLogs } from "./userActivityLogs.seed.js";
import { seedUserFeedback } from "./userFeedback.seed.js";
import { seedUsers } from "./users.seed.js";
import { seedUserSettings } from "./userSettings.seed.js";
import { seedVideoCalls } from "./videoCalls.seed.js";

async function clearDatabase() {
  const tables = [
    "payments",
    "lab_results",
    "user_feedback",
    "doctor_availability",
    "user_settings",
    "user_activity_logs",
    "notifications",
    "reviews",
    "prescriptions",
    "medical_records",
    "video_calls",
    "chat_messages",
    "chat_rooms",
    "appointments",
    "doctor_profiles",
    "users",
  ];

  // Clear tables in reverse order of foreign key dependencies
  for (const table of tables) {
    try {
      await db.execute(sql`DELETE FROM ${sql.identifier(table)}`);
      console.log(`🧹 Cleared table ${table}`);

      // Attempt to reset sequence if it exists (silently fail if not)
      try {
        await db.execute(
          sql`ALTER SEQUENCE ${sql.identifier(
            `${table}_id_seq`
          )} RESTART WITH 1`
        );
      } catch (seqError) {
        // Silently ignore sequence errors
      }
    } catch (error) {
      console.error(`❌ Error clearing table ${table}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log("🌱 Starting database seeding...");

  if (process.env.NODE_ENV !== "production") {
    try {
      await clearDatabase();
    } catch (error) {
      console.error("❌ Error clearing database:", error);
      process.exit(1);
    }
  }

  try {
    // Seed in proper dependency order
    const users = await seedUsers();
    const doctorProfiles = await seedDoctorProfiles(users);
    const doctorAvailability = await seedDoctorAvailability(users);
    const userSettings = await seedUserSettings(users);

    const appointments = await seedAppointments(users);
    const chatRooms = await seedChatRooms(users);
    const chatMessages = await seedChatMessages(users, chatRooms);

    const videoCalls = await seedVideoCalls(users, chatRooms, appointments);

    const medicalRecords = await seedMedicalRecords(users, appointments);
    const prescriptions = await seedPrescriptions(users, appointments);
    const labResults = await seedLabResults(users, appointments);

    const reviews = await seedReviews(users, appointments);
    const payments = await seedPayments(users, appointments);

    await seedNotifications(users, appointments);
    await seedUserActivityLogs(users);
    await seedUserFeedback(users);

    console.log("✅ Database seeding completed!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

main().finally(() => {
  process.exit(0);
});
