import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { doctorAvailability } from "../schema.js";

export async function seedDoctorAvailability(users) {
  // Filter doctors from users
  const doctors = users.filter((u) => u.role === "doctor");

  if (doctors.length === 0) {
    throw new Error("No doctors found to create availability");
  }

  // Generate realistic availability slots
  const availabilityData = [];

  doctors.forEach((doctor) => {
    // Create 3-5 availability slots per doctor
    const slotCount = faker.number.int({ min: 3, max: 5 });

    for (let i = 0; i < slotCount; i++) {
      const startHour = faker.number.int({ min: 8, max: 16 }); // 8AM to 4PM
      const dayOfWeek = faker.number.int({ min: 0, max: 6 }); // 0=Sunday to 6=Saturday

      const availableFrom = new Date();
      availableFrom.setHours(startHour, 0, 0, 0);
      availableFrom.setDate(availableFrom.getDate() + dayOfWeek);

      const availableTo = new Date(availableFrom);
      availableTo.setHours(
        availableFrom.getHours() + faker.number.int({ min: 1, max: 4 })
      );

      availabilityData.push({
        doctorId: doctor.userId,
        availableFrom,
        availableTo,
        dayOfWeek,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  try {
    const insertedAvailability = await db
      .insert(doctorAvailability)
      .values(availabilityData)
      .returning();

    console.log(
      `⏰ Seeded ${insertedAvailability.length} doctor availability slots`
    );
    return insertedAvailability;
  } catch (error) {
    console.error("❌ Error seeding doctor availability:", error);
    throw error;
  }
}
