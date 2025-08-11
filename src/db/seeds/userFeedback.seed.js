import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { userFeedback } from "../schema.js";

export async function seedUserFeedback(users) {
  if (users.length === 0) {
    throw new Error("Need users to create feedback");
  }

  const categories = [
    "app_improvement",
    "doctor_experience",
    "payment_issues",
    "feature_request",
    "technical_problem",
    "general_feedback",
  ];

  // Create 2-5 feedback entries per user
  const feedbackData = users.flatMap((user) => {
    const feedbackCount = faker.number.int({ min: 2, max: 5 });
    return Array.from({ length: feedbackCount }, () => {
      const feedbackDate = faker.date.between({
        from: new Date(user.createdAt),
        to: new Date(),
      });

      return {
        userId: user.userId,
        feedback: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        category: faker.helpers.arrayElement(categories),
        createdAt: feedbackDate,
        updatedAt: feedbackDate,
      };
    });
  });

  try {
    const insertedFeedback = await db
      .insert(userFeedback)
      .values(feedbackData)
      .returning();

    console.log(`💬 Seeded ${insertedFeedback.length} user feedback entries`);
    return insertedFeedback;
  } catch (error) {
    console.error("❌ Error seeding user feedback:", error);
    throw error;
  }
}
