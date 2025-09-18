import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import { medications } from "../schema.js";

export async function seedMedications(users, medicalRecords) {
  const patients = users.filter(user => user.role === 'patient');
  const doctors = users.filter(user => user.role === 'doctor');

  if (patients.length === 0 || doctors.length === 0 || medicalRecords.length === 0) {
    throw new Error('Need patients, doctors, and medical records for medications');
  }

  // Create a comprehensive medication template library
  const medicationTemplates = [
    {
      name: "Loratadine",
      dosage: "10mg",
      frequency: "once daily",
      instructions: "Take in the morning with food",
      duration: 90, // days
      condition: "Allergies"
    },
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "three times daily",
      instructions: "Take with plenty of water, complete full course",
      duration: 7, // days
      condition: "Bacterial infection"
    },
    {
      name: "Lisinopril",
      dosage: "5mg",
      frequency: "once daily",
      instructions: "Take in the morning, monitor blood pressure",
      duration: null, // ongoing
      condition: "Hypertension"
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "twice daily",
      instructions: "Take with meals to reduce stomach upset",
      duration: null, // ongoing
      condition: "Type 2 Diabetes"
    },
    {
      name: "Fluticasone nasal spray",
      dosage: "50mcg",
      frequency: "twice daily",
      instructions: "Spray once in each nostril morning and evening",
      duration: 30, // days
      condition: "Allergic rhinitis"
    },
    {
      name: "Epinephrine Auto-Injector",
      dosage: "0.3mg",
      frequency: "as needed",
      instructions: "Use only in case of severe allergic reaction",
      duration: 365, // days
      condition: "Severe allergies"
    },
    {
      name: "Omeprazole",
      dosage: "20mg",
      frequency: "once daily",
      instructions: "Take before breakfast",
      duration: 60, // days
      condition: "GERD"
    },
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "once daily",
      instructions: "Take in the evening",
      duration: null, // ongoing
      condition: "High cholesterol"
    }
  ];

  const medicationData = [];
  
  // Ensure each patient gets 2-4 medications
  patients.forEach((patient, patientIndex) => {
    const numMedications = Math.floor(Math.random() * 3) + 2; // 2-4 medications per patient
    const patientMedicalRecords = medicalRecords.filter(record => record.patientId === patient.userId);
    
    // Shuffle medication templates to get random selection
    const shuffledTemplates = [...medicationTemplates].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numMedications, shuffledTemplates.length); i++) {
      const template = shuffledTemplates[i];
      const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
      const randomMedicalRecord = patientMedicalRecords.length > 0 
        ? patientMedicalRecords[Math.floor(Math.random() * patientMedicalRecords.length)]
        : medicalRecords[Math.floor(Math.random() * medicalRecords.length)];
      
      // Ensure we have a good mix of active and inactive medications
      const shouldBeActive = Math.random() > 0.3; // 70% chance to be active
      
      let startDate, endDate, isActive;
      
      if (shouldBeActive) {
        // For active medications, start them recently and ensure they're still ongoing
        const startDaysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
        startDate = new Date(Date.now() - startDaysAgo * 24 * 60 * 60 * 1000);
        
        if (template.duration) {
          endDate = new Date(startDate.getTime() + template.duration * 24 * 60 * 60 * 1000);
          // If the calculated end date is in the past, extend it to the future
          if (endDate < new Date()) {
            endDate = new Date(Date.now() + (template.duration - startDaysAgo) * 24 * 60 * 60 * 1000);
          }
        } else {
          endDate = null; // Ongoing medication
        }
        isActive = true;
      } else {
        // For inactive medications, make them properly finished
        const startDaysAgo = Math.floor(Math.random() * 90) + 30; // 30-120 days ago
        startDate = new Date(Date.now() - startDaysAgo * 24 * 60 * 60 * 1000);
        
        if (template.duration) {
          endDate = new Date(startDate.getTime() + template.duration * 24 * 60 * 60 * 1000);
        } else {
          // For ongoing medications that are inactive, set an end date
          endDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        }
        isActive = false;
      }
      
      medicationData.push({
        id: uuidv4(),
        patientId: patient.userId,
        prescribedBy: randomDoctor.userId,
        name: template.name,
        dosage: template.dosage,
        frequency: template.frequency,
        instructions: template.instructions,
        startDate: startDate,
        endDate: endDate,
        isActive: isActive
      });
    }
  });

  const insertedMedications = await db.insert(medications).values(medicationData).returning();

  console.log(`💊 Seeded ${insertedMedications.length} medications`);
  return insertedMedications;
}