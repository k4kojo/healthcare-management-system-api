import { db } from "../../config/db.js";
import { medicalRecords } from "../schema.js";

export async function seedMedicalRecords(users, appointments) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (
    doctors.length === 0 ||
    patients.length === 0 ||
    appointments.length === 0
  ) {
    throw new Error(
      "Need doctors, patients, and appointments for medical records"
    );
  }

  const recordData = [
    {
      patientId: patients[0].userId,
      doctorId: doctors[0].userId,
      appointmentId: appointments[0].appointmentId,
      recordType: "general",
      diagnosis: "Hypertension",
      treatment: "Prescribed medication and lifestyle changes",
      notes: "Patient to follow up in 3 months",
    },
    {
      patientId: patients[1].userId,
      doctorId: doctors[0].userId,
      appointmentId: appointments[1].appointmentId,
      recordType: "general",
      diagnosis: "Lower back pain",
      treatment: "Physical therapy recommended",
      notes: "Patient to return if symptoms worsen",
    },
  ];

  const insertedRecords = await db
    .insert(medicalRecords)
    .values(recordData)
    .returning();

  console.log(`🏥 Seeded ${insertedRecords.length} medical records`);
  return insertedRecords;
}
