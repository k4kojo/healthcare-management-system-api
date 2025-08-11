import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import { payments } from "../schema.js";

export async function seedPayments(users, appointments) {
  const patients = users.filter((u) => u.role === "patient");

  if (patients.length === 0 || appointments.length === 0) {
    throw new Error("Need patients and appointments to create payments");
  }

  const paymentMethods = [
    "MTN MoMo",
    "Telecel Cash",
    "AirtelTigo Cash",
    "Credit Card",
  ];

  const paymentStatuses = [
    "pending",
    "completed",
    "failed",
    "refunded",
    "processing",
  ];

  const paymentData = appointments.map((appointment) => {
    const isPaid = faker.datatype.boolean(0.7); // 70% chance of being paid

    // Ensure createdAt is before appointmentDate
    const createdAt = new Date(appointment.createdAt);
    const appointmentDate = new Date(appointment.appointmentDate);

    // Fix date range issue
    let paymentDate = null;
    if (isPaid) {
      // If createdAt is after appointmentDate, use a reasonable date range
      if (createdAt > appointmentDate) {
        paymentDate = faker.date.between({
          from: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
          to: appointmentDate,
        });
      } else {
        paymentDate = faker.date.between({
          from: createdAt,
          to: appointmentDate,
        });
      }
    }

    return {
      paymentId: uuidv4(),
      appointmentId: appointment.appointmentId,
      userId: appointment.patientId,
      amount: appointment.appointmentAmount,
      status: isPaid
        ? faker.helpers.arrayElement(
            paymentStatuses.filter((s) => s !== "pending")
          )
        : "pending",
      method: isPaid ? faker.helpers.arrayElement(paymentMethods) : null,
      providerRef: isPaid ? `REF-${faker.string.alphanumeric(10)}` : null,
      createdAt: createdAt,
      updatedAt: paymentDate || createdAt,
    };
  });

  try {
    const insertedPayments = await db
      .insert(payments)
      .values(paymentData)
      .returning();

    console.log(`💰 Seeded ${insertedPayments.length} payments`);
    return insertedPayments;
  } catch (error) {
    console.error("❌ Error seeding payments:", error);
    throw error;
  }
}
