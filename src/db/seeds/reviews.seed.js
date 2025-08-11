import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { reviews } from "../schema.js";

export async function seedReviews(users, appointments) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );

  if (
    doctors.length === 0 ||
    patients.length === 0 ||
    completedAppointments.length === 0
  ) {
    throw new Error(
      "Need doctors, patients, and completed appointments to create reviews"
    );
  }

  const reviewData = completedAppointments.map((appointment) => {
    const reviewDate = faker.date.between({
      from: appointment.appointmentDate,
      to: new Date(
        appointment.appointmentDate.getTime() + 14 * 24 * 60 * 60 * 1000
      ), // up to 2 weeks after appointment
    });

    return {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: faker.datatype.boolean(0.8)
        ? appointment.appointmentId
        : null, // 80% link to appointment
      rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
      comment: faker.datatype.boolean(0.7) ? faker.lorem.paragraph() : null, // 70% have comments
      createdAt: reviewDate,
      updatedAt: reviewDate,
    };
  });

  try {
    const insertedReviews = await db
      .insert(reviews)
      .values(reviewData)
      .returning();

    console.log(`⭐ Seeded ${insertedReviews.length} reviews`);
    return insertedReviews;
  } catch (error) {
    console.error("❌ Error seeding reviews:", error);
    throw error;
  }
}
