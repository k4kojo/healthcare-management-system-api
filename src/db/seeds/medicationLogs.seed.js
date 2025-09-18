import { db } from "../../config/db.js";
import { medicationLogs } from "../schema.js";

export async function seedMedicationLogs(medications) {
  const logData = [];


  // Create logs for each medication
  medications.forEach(medication => {
    // Only create logs for active medications
    if (!medication.isActive) return;
    
    const startDate = new Date(medication.startDate);
    const now = new Date();
    
    // Create logs for the past 14 days for active medications (more data for better analytics)
    for (let i = 0; i < 14; i++) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - i);
      
      // Only create logs for dates after medication start date
      if (logDate >= startDate) {
        // Skip some days randomly to simulate real-world usage patterns
        if (Math.random() > 0.85) continue; // 15% chance to skip entire day
        
        logData.push({
          medicationId: medication.id,
          takenAt: new Date(logDate.setHours(9, 0, 0, 0)), // Morning dose
          status: Math.random() > 0.15 ? "taken" : (Math.random() > 0.5 ? "missed" : "skipped"), // 85% taken, 7.5% missed, 7.5% skipped
          notes: Math.random() > 0.9 ? "Felt nauseous after taking" : null
        });

        // Add second dose for medications with multiple daily frequencies
        if (medication.frequency.includes('twice') || medication.frequency.includes('three')) {
          logData.push({
            medicationId: medication.id,
            takenAt: new Date(logDate.setHours(18, 0, 0, 0)), // Evening dose
            status: Math.random() > 0.2 ? "taken" : (Math.random() > 0.5 ? "missed" : "skipped"), // 80% taken, 10% missed, 10% skipped
            notes: Math.random() > 0.95 ? "Took with dinner" : null
          });
        }

        // Add third dose for medications with three times daily frequency
        if (medication.frequency.includes('three')) {
          logData.push({
            medicationId: medication.id,
            takenAt: new Date(logDate.setHours(14, 0, 0, 0)), // Afternoon dose
            status: Math.random() > 0.25 ? "taken" : (Math.random() > 0.5 ? "missed" : "skipped"), // 75% taken, 12.5% missed, 12.5% skipped
            notes: null
          });
        }
      }
    }
  });

  // Only insert if we have log data
  if (logData.length === 0) {
    console.log(`📝 No medication logs to seed (no active medications found)`);
    return [];
  }

  const insertedLogs = await db.insert(medicationLogs).values(logData).returning();

  console.log(`📝 Seeded ${insertedLogs.length} medication logs`);
  return insertedLogs;
}