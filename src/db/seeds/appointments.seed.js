import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { appointments } from "../schema.js";

export async function seedAppointments(users) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (doctors.length === 0 || patients.length === 0) {
    throw new Error("Need at least one doctor and patient for appointments");
  }

  const appointmentData = [];

  // For each patient, create 2-4 appointments with random doctors
  for (const patient of patients) {
    const count = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < count; i++) {
      const doctor = faker.helpers.arrayElement(doctors);
      const isFuture = faker.datatype.boolean();
      const date = isFuture
        ? faker.date.soon({ days: 45 })
        : faker.date.recent({ days: 60 });
      const mode = faker.helpers.arrayElement(["Online", "In-person"]);
      const amount = faker.number.int({ min: 80, max: 300 });
      const paid = faker.number.int({ min: 0, max: amount });
      const status = isFuture
        ? faker.helpers.arrayElement(["pending", "confirmed"])
        : faker.helpers.arrayElement(["completed", "cancelled", "rescheduled"]);
      const paymentStatus = paid === 0 ? "pending" : paid < amount ? "partial" : "completed";
      const paymentMethod = paid === 0 ? null : faker.helpers.arrayElement(["MTN MoMo", "Telecel Cash", "AirtelTigo Cash", "Credit Card"]);

      appointmentData.push({
        appointmentId: faker.string.uuid(),
        patientId: patient.userId,
        doctorId: doctor.userId,
        appointmentDate: date,
        appointmentMode: mode,
        reasonForVisit: faker.helpers.arrayElement([
          "Annual checkup",
          "Back pain consultation",
          "Headache",
          "Follow-up visit",
          "Blood pressure review",
        ]),
        appointmentAmount: amount,
        paidAmount: paid,
        paymentMethod,
        paymentStatus,
        status,
      });
    }
  }

  const insertedAppointments = await db
    .insert(appointments)
    .values(appointmentData)
    .returning();

  console.log(`📅 Seeded ${insertedAppointments.length} appointments for ${patients.length} patients with ${doctors.length} doctors`);
  return insertedAppointments;
}
