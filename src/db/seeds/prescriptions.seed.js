import { db } from "../../config/db.js";
import { prescriptions } from "../schema.js";

export async function seedPrescriptions(users, appointments) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (
    doctors.length === 0 ||
    patients.length === 0 ||
    appointments.length === 0
  ) {
    throw new Error(
      "Need doctors, patients, and appointments for prescriptions"
    );
  }

  const prescriptionData = [
    {
      appointmentId: appointments[0].appointmentId,
      doctorId: doctors[0].userId,
      medication: "Lisinopril 10mg",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      instructions: "Take in the morning with food",
    },
    {
      appointmentId: appointments[1].appointmentId,
      doctorId: doctors[0].userId,
      medication: "Ibuprofen 400mg",
      dosage: "400mg",
      frequency: "Every 6 hours as needed",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      instructions: "Take with food to avoid stomach upset",
    },
  ];

  const insertedPrescriptions = await db
    .insert(prescriptions)
    .values(prescriptionData)
    .returning();

  console.log(`💊 Seeded ${insertedPrescriptions.length} prescriptions`);
  return insertedPrescriptions;
}
