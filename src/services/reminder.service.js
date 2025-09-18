import { eq, and, lte, gte } from "drizzle-orm";
import { db } from "../config/db.js";
import { medications, medicationReminders, users } from "../db/schema.js";

/**
 * Parse frequency string and return reminder times for a day
 * @param {string} frequency - e.g., "2 times/day", "3 times daily", "once daily"
 * @returns {string[]} Array of time strings in HH:MM format
 */
function parseFrequencyToTimes(frequency) {
  const lowerFreq = frequency.toLowerCase();
  
  // Extract number from frequency
  const match = lowerFreq.match(/(\d+)/);
  const timesPerDay = match ? parseInt(match[1]) : 1;
  
  // Default time slots based on frequency
  const timeSlots = {
    1: ["08:00"], // Once daily - morning
    2: ["08:00", "20:00"], // Twice daily - morning and evening
    3: ["08:00", "14:00", "20:00"], // Three times - morning, afternoon, evening
    4: ["08:00", "12:00", "16:00", "20:00"], // Four times
    5: ["08:00", "11:00", "14:00", "17:00", "20:00"], // Five times
    6: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"], // Six times
  };
  
  return timeSlots[Math.min(timesPerDay, 6)] || timeSlots[1];
}

/**
 * Calculate reminder dates based on medication schedule
 * @param {Object} medication - Medication object
 * @returns {Date[]} Array of reminder dates
 */
function calculateReminderDates(medication) {
  const { startDate, endDate, frequency } = medication;
  const reminderTimes = parseFrequencyToTimes(frequency);
  const reminders = [];
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default to 1 year if no end date
  
  // Generate reminders for each day in the range
  for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
    reminderTimes.forEach(timeString => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const reminderDate = new Date(currentDate);
      reminderDate.setHours(hours, minutes, 0, 0);
      
      // Only add future reminders
      if (reminderDate > new Date()) {
        reminders.push(new Date(reminderDate));
      }
    });
  }
  
  return reminders;
}

/**
 * Schedule reminders for a medication
 * @param {Object} medication - Medication object
 * @returns {Promise<Object[]>} Created reminder objects
 */
export async function scheduleReminders(medication) {
  try {
    const reminderDates = calculateReminderDates(medication);
    
    if (reminderDates.length === 0) {
      console.log(`No future reminders to schedule for medication ${medication.id}`);
      return [];
    }
    
    // Create reminder records
    const reminderData = reminderDates.map(date => ({
      medicationId: medication.id,
      remindAt: date,
      message: `Time to take your medication: ${medication.name} (${medication.dosage})`,
    }));
    
    const createdReminders = await db
      .insert(medicationReminders)
      .values(reminderData)
      .returning();
    
    console.log(`Scheduled ${createdReminders.length} reminders for medication ${medication.name}`);
    return createdReminders;
  } catch (error) {
    console.error("Error scheduling reminders:", error);
    throw error;
  }
}

/**
 * Send a medication reminder (placeholder implementation)
 * In production, this would integrate with:
 * - Firebase Cloud Messaging for mobile push notifications
 * - Twilio for SMS
 * - Email service for email notifications
 * @param {Object} reminder - Reminder object
 * @returns {Promise<boolean>} Success status
 */
export async function sendMedicationReminder(reminder) {
  try {
    // Get medication and patient details
    const [medicationData] = await db
      .select({
        medication: medications,
        patient: users,
      })
      .from(medicationReminders)
      .innerJoin(medications, eq(medicationReminders.medicationId, medications.id))
      .innerJoin(users, eq(medications.patientId, users.userId))
      .where(eq(medicationReminders.id, reminder.id));
    
    if (!medicationData) {
      console.error(`Medication or patient not found for reminder ${reminder.id}`);
      return false;
    }
    
    const { medication, patient } = medicationData;
    
    // Placeholder notification - in production, replace with actual notification service
    console.log(`🔔 MEDICATION REMINDER`);
    console.log(`To: ${patient.firstName} ${patient.lastName} (${patient.email})`);
    console.log(`Message: ${reminder.message || `Time to take ${medication.name} (${medication.dosage})`}`);
    console.log(`Scheduled for: ${reminder.remindAt}`);
    console.log(`Medication: ${medication.name}`);
    console.log(`Dosage: ${medication.dosage}`);
    console.log(`Frequency: ${medication.frequency}`);
    console.log(`Instructions: ${medication.instructions || 'No special instructions'}`);
    console.log(`---`);
    
    // Mark reminder as sent
    await db
      .update(medicationReminders)
      .set({ 
        sent: true, 
        sentAt: new Date() 
      })
      .where(eq(medicationReminders.id, reminder.id));
    
    return true;
  } catch (error) {
    console.error("Error sending medication reminder:", error);
    return false;
  }
}

/**
 * Process pending reminders (to be called by cron job)
 * @returns {Promise<number>} Number of reminders processed
 */
export async function processPendingReminders() {
  try {
    const now = new Date();
    
    // Get all pending reminders that are due
    const pendingReminders = await db
      .select()
      .from(medicationReminders)
      .where(
        and(
          eq(medicationReminders.sent, false),
          lte(medicationReminders.remindAt, now)
        )
      );
    
    console.log(`Processing ${pendingReminders.length} pending reminders`);
    
    let processedCount = 0;
    
    for (const reminder of pendingReminders) {
      const success = await sendMedicationReminder(reminder);
      if (success) {
        processedCount++;
      }
    }
    
    console.log(`Successfully processed ${processedCount}/${pendingReminders.length} reminders`);
    return processedCount;
  } catch (error) {
    console.error("Error processing pending reminders:", error);
    throw error;
  }
}

/**
 * Clean up old reminders (older than 30 days)
 * @returns {Promise<number>} Number of reminders cleaned up
 */
export async function cleanupOldReminders() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deletedReminders = await db
      .delete(medicationReminders)
      .where(
        and(
          eq(medicationReminders.sent, true),
          lte(medicationReminders.sentAt, thirtyDaysAgo)
        )
      )
      .returning();
    
    console.log(`Cleaned up ${deletedReminders.length} old reminders`);
    return deletedReminders.length;
  } catch (error) {
    console.error("Error cleaning up old reminders:", error);
    throw error;
  }
}

/**
 * Get upcoming reminders for a patient
 * @param {string} patientId - Patient UUID
 * @param {number} days - Number of days to look ahead (default: 7)
 * @returns {Promise<Object[]>} Upcoming reminders
 */
export async function getUpcomingReminders(patientId, days = 7) {
  try {
    const now = new Date();
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    const upcomingReminders = await db
      .select({
        reminder: medicationReminders,
        medication: medications,
      })
      .from(medicationReminders)
      .innerJoin(medications, eq(medicationReminders.medicationId, medications.id))
      .where(
        and(
          eq(medications.patientId, patientId),
          eq(medicationReminders.sent, false),
          gte(medicationReminders.remindAt, now),
          lte(medicationReminders.remindAt, futureDate)
        )
      )
      .orderBy(medicationReminders.remindAt);
    
    return upcomingReminders;
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    throw error;
  }
}
