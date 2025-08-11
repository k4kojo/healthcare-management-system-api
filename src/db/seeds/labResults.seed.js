import { faker } from "@faker-js/faker";
import { db } from "../../config/db.js";
import { labResults } from "../schema.js";

export async function seedLabResults(users, appointments) {
  const doctors = users.filter((u) => u.role === "doctor");
  const patients = users.filter((u) => u.role === "patient");

  if (
    doctors.length === 0 ||
    patients.length === 0 ||
    appointments.length === 0
  ) {
    throw new Error(
      "Need doctors, patients, and appointments to create lab results"
    );
  }

  const testTypes = [
    "Complete Blood Count",
    "Lipid Panel",
    "Basic Metabolic Panel",
    "Thyroid Stimulating Hormone",
    "Hemoglobin A1C",
    "Liver Function Test",
    "Urinalysis",
    "COVID-19 PCR Test",
  ];

  const resultData = appointments.map((appointment) => {
    const testDate = faker.date.between({
      from: appointment.appointmentDate,
      to: new Date(
        appointment.appointmentDate.getTime() + 7 * 24 * 60 * 60 * 1000
      ), // 1 week after appointment
    });

    return {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment.appointmentId,
      testName: faker.helpers.arrayElement(testTypes),
      result: faker.helpers.arrayElement([
        "Normal",
        "Abnormal",
        "Critical",
        "Pending",
        "Inconclusive",
      ]),
      resultDate: testDate,
      notes: faker.lorem.sentence(),
      fileUrl: faker.datatype.boolean()
        ? `https://example.com/lab-reports/${faker.string.uuid()}.pdf`
        : null,
    };
  });

  try {
    const insertedResults = await db
      .insert(labResults)
      .values(resultData)
      .returning();

    console.log(`🧪 Seeded ${insertedResults.length} lab results`);
    return insertedResults;
  } catch (error) {
    console.error("❌ Error seeding lab results:", error);
    throw error;
  }
}
