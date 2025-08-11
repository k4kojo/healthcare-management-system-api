import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { appointments } from "../schema.js";

export async function seedAppointments(users) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (doctors.length === 0 || patients.length === 0) {
    throw new Error("Need at least one doctor and patient for appointments");
  }

  const appointmentData = [
    {
      appointmentId: faker.string.uuid(),
      patientId: patients[0].userId,
      doctorId: doctors[0].userId,
      appointmentDate: faker.date.future(),
      appointmentMode: "Online",
      reasonForVisit: "Annual checkup",
      appointmentAmount: 150.0,
      paidAmount: 150.0,
      paymentMethod: "MTN MoMo",
      paymentStatus: "completed",
      status: "confirmed",
    },
    {
      appointmentId: faker.string.uuid(),
      patientId: patients[1].userId,
      doctorId: doctors[0].userId,
      appointmentDate: faker.date.future(),
      appointmentMode: "In-person",
      reasonForVisit: "Back pain consultation",
      appointmentAmount: 200.0,
      paidAmount: 100.0,
      paymentMethod: "AirtelTigo Cash",
      paymentStatus: "partial",
      status: "confirmed",
    },
    {
      appointmentId: faker.string.uuid(),
      patientId: patients[0].userId,
      doctorId: doctors[0].userId,
      appointmentDate: faker.date.past(),
      appointmentMode: "Online",
      reasonForVisit: "Follow-up visit",
      appointmentAmount: 120.0,
      paidAmount: 120.0,
      paymentMethod: "Credit Card",
      paymentStatus: "completed",
      status: "completed",
    },
  ];

  const insertedAppointments = await db
    .insert(appointments)
    .values(appointmentData)
    .returning();

  console.log(`📅 Seeded ${insertedAppointments.length} appointments`);
  return insertedAppointments;
}
