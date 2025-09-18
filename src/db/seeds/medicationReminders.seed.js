import { db } from "../../config/db.js";
import { medicationReminders } from "../schema.js";

export async function seedMedicationReminders(medications) {
  const reminderData = [];

  medications.forEach(medication => {
    const frequency = medication.frequency.toLowerCase();
    const now = new Date();
    
    // Create reminders for the next 3 days
    for (let i = 0; i < 3; i++) {
      const reminderDate = new Date(now);
      reminderDate.setDate(reminderDate.getDate() + i);
      
      if (frequency.includes('once daily')) {
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(8, 0, 0, 0)), // 8 AM
          message: `Time to take your ${medication.name} (${medication.dosage})`
        });
      }
      else if (frequency.includes('twice daily')) {
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(8, 0, 0, 0)), // 8 AM
          message: `Morning dose: ${medication.name} (${medication.dosage})`
        });
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(20, 0, 0, 0)), // 8 PM
          message: `Evening dose: ${medication.name} (${medication.dosage})`
        });
      }
      else if (frequency.includes('three times daily')) {
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(8, 0, 0, 0)), // 8 AM
          message: `Morning dose: ${medication.name} (${medication.dosage})`
        });
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(14, 0, 0, 0)), // 2 PM
          message: `Afternoon dose: ${medication.name} (${medication.dosage})`
        });
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(20, 0, 0, 0)), // 8 PM
          message: `Evening dose: ${medication.name} (${medication.dosage})`
        });
      }
      else if (frequency.includes('as needed')) {
        // Only one reminder for PRN medications
        reminderData.push({
          medicationId: medication.id,
          remindAt: new Date(reminderDate.setHours(12, 0, 0, 0)), // Noon
          message: `Remember you have ${medication.name} available if needed`
        });
      }
    }
  });

  const insertedReminders = await db.insert(medicationReminders).values(reminderData).returning();

  console.log(`⏰ Seeded ${insertedReminders.length} medication reminders`);
  return insertedReminders;
}