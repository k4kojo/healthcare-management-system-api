import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { userSettings } from "../schema.js";

export async function seedUserSettings(users) {
  if (users.length === 0) {
    throw new Error("Need users to create settings");
  }

  const languages = ["en", "fr", "es", "de", "sw"];
  const notificationPreferences = [true, false];

  const settingsData = users.map((user) => {
    const createdAt = faker.date.between({
      from: new Date(user.createdAt),
      to: new Date(user.createdAt.getTime() + 24 * 60 * 60 * 1000), // within 1 day of account creation
    });

    return {
      userId: user.userId,
      notificationEnabled: faker.helpers.arrayElement(notificationPreferences),
      darkMode: faker.datatype.boolean(),
      language: faker.helpers.arrayElement(languages),
      createdAt,
      updatedAt: createdAt,
    };
  });

  try {
    const insertedSettings = await db
      .insert(userSettings)
      .values(settingsData)
      .returning();

    console.log(`⚙️ Seeded ${insertedSettings.length} user settings`);
    return insertedSettings;
  } catch (error) {
    console.error("❌ Error seeding user settings:", error);
    throw error;
  }
}
