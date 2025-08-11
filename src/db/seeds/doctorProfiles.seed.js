import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { doctorProfile } from "../schema.js";

export async function seedDoctorProfiles(users) {
  // Filter doctors from users
  const doctors = users.filter((u) => u.role === "doctor");

  if (doctors.length === 0) {
    throw new Error("No doctors found to create profiles");
  }

  const specializations = [
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
    "General Practice",
    "Ophthalmology",
    "Psychiatry",
  ];

  const profileData = doctors.map((doctor) => ({
    doctorId: doctor.userId,
    specialization: faker.helpers.arrayElement(specializations),
    licenseNumber: `MD-${faker.string.numeric(6)}-${faker.string
      .alpha(2)
      .toUpperCase()}`,
    bio: faker.lorem.paragraphs(2),
    reviews: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    experienceYears: faker.number.int({ min: 1, max: 30 }).toString(),
  }));

  try {
    const insertedProfiles = await db
      .insert(doctorProfile)
      .values(profileData)
      .returning();

    console.log(`👨‍⚕️ Seeded ${insertedProfiles.length} doctor profiles`);
    return insertedProfiles;
  } catch (error) {
    console.error("❌ Error seeding doctor profiles:", error);
    throw error;
  }
}
