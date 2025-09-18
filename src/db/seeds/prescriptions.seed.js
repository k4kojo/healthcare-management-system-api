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

  const meds = [
    { name: "Lisinopril", dose: "10mg", freq: "Once daily" },
    { name: "Ibuprofen", dose: "400mg", freq: "Every 6 hours as needed" },
    { name: "Amoxicillin", dose: "500mg", freq: "3 times daily" },
    { name: "Metformin", dose: "500mg", freq: "Twice daily" },
  ];

  const prescriptionData = appointments.slice(0, Math.min(appointments.length, 50)).map((a) => {
    const m = meds[Math.floor(Math.random() * meds.length)];
    const start = new Date();
    const end = new Date(Date.now() + Math.floor(Math.random() * 30 + 7) * 24 * 60 * 60 * 1000);
    return {
      appointmentId: a.appointmentId,
      doctorId: a.doctorId,
      medication: `${m.name} ${m.dose}`,
      dosage: m.dose,
      frequency: m.freq,
      startDate: start,
      endDate: end,
      instructions: "Auto-generated prescription",
    };
  });

  const insertedPrescriptions = await db.insert(prescriptions).values(prescriptionData).returning();

  console.log(`💊 Seeded ${insertedPrescriptions.length} prescriptions`);
  return insertedPrescriptions;
}
