import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { userActivityLogs } from "../schema.js";

export async function seedUserActivityLogs(users) {
  if (users.length === 0) {
    throw new Error("Need users to create activity logs");
  }

  const activityTypes = [
    "login",
    "logout",
    "appointment_booked",
    "appointment_cancelled",
    "profile_updated",
    "payment_made",
    "prescription_viewed",
    "lab_results_viewed",
  ];

  // Create 5-10 activity logs per user
  const activityData = users.flatMap((user) => {
    const logCount = faker.number.int({ min: 5, max: 10 });
    return Array.from({ length: logCount }, () => {
      const activityDate = faker.date.between({
        from: new Date(user.createdAt),
        to: new Date(),
      });

      return {
        userId: user.userId,
        activityType: faker.helpers.arrayElement(activityTypes),
        activityDetails: getActivityDetails(user, activityTypes),
        timestamp: activityDate,
      };
    });
  });

  function getActivityDetails(user, activityTypes) {
    const type = faker.helpers.arrayElement(activityTypes);
    switch (type) {
      case "login":
        return `User logged in from ${faker.location.city()}`;
      case "appointment_booked":
        return `Booked appointment with Dr. ${
          user.role === "doctor" ? "Self" : "Smith"
        }`;
      case "payment_made":
        return `Payment of GHS ${faker.finance.amount({
          min: 50,
          max: 500,
        })} processed`;
      default:
        return `${type.replace("_", " ")} activity`;
    }
  }

  try {
    const insertedLogs = await db
      .insert(userActivityLogs)
      .values(activityData)
      .returning();

    console.log(`📝 Seeded ${insertedLogs.length} user activity logs`);
    return insertedLogs;
  } catch (error) {
    console.error("❌ Error seeding user activity logs:", error);
    throw error;
  }
}
