import { db } from "../../config/db.js";
import { medicalRecords } from "../schema.js";

export async function seedMedicalRecords(users, appointments) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (doctors.length === 0 || patients.length === 0 || appointments.length === 0) {
    throw new Error("Need doctors, patients, and appointments for medical records");
  }

  const recordData = appointments.slice(0, Math.min(appointments.length, 50)).map((appt) => ({
    patientId: appt.patientId,
    doctorId: appt.doctorId,
    appointmentId: appt.appointmentId,
    recordType: "general",
    diagnosis: "Hypertension",
    treatment: "Prescribed medication and lifestyle changes",
    notes: "Auto-generated record",
  }));

  const insertedRecords = await db.insert(medicalRecords).values(recordData).returning();
  console.log(`🏥 Seeded ${insertedRecords.length} medical records`);
  return insertedRecords;
}
