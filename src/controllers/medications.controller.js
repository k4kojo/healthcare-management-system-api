import { eq, and, desc, asc, gte, lte, or } from "drizzle-orm";
import { db } from "../config/db.js";
import { 
  medications, 
  medicationLogs, 
  medicationReminders,
  users 
} from "../db/schema.js";
import { scheduleReminders } from "../services/reminder.service.js";

/**
 * Create a new medication (Doctor only)
 * POST /api/v0/medications
 */
export async function createMedication(req, res) {
  try {
    const { patientId, name, dosage, frequency, startDate, endDate, instructions } = req.body;
    const prescribedBy = req.user.userId;

    // Verify patient exists
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.userId, patientId));

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: "Patient not found",
      });
    }

    if (patient.role !== "patient") {
      return res.status(400).json({
        success: false,
        error: "The specified user is not a patient",
      });
    }

    // Create medication
    const [newMedication] = await db
      .insert(medications)
      .values({
        patientId,
        prescribedBy,
        name,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        instructions,
      })
      .returning();

    // Schedule reminders
    try {
      await scheduleReminders(newMedication);
    } catch (reminderError) {
      console.error("Error scheduling reminders:", reminderError);
      // Don't fail the medication creation if reminder scheduling fails
    }

    // Get the created medication with prescriber info
    const [medicationWithPrescriber] = await db
      .select({
        medication: medications,
        prescriber: {
          id: users.userId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(medications)
      .leftJoin(users, eq(medications.prescribedBy, users.userId))
      .where(eq(medications.id, newMedication.id));

    res.status(201).json({
      success: true,
      data: medicationWithPrescriber,
      message: "Medication created successfully",
    });
  } catch (error) {
    console.error("Error creating medication:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get all medications for a patient
 * GET /api/v0/medications/:patientId
 */
export async function getMedicationsByPatient(req, res) {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, isActive, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [eq(medications.patientId, patientId)];

    // Add filters
    if (isActive !== undefined) {
      whereConditions.push(eq(medications.isActive, isActive === "true"));
    }

    if (startDate) {
      whereConditions.push(gte(medications.startDate, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(medications.startDate, new Date(endDate)));
    }

    // Get medications with prescriber info
    const medicationList = await db
      .select({
        medication: medications,
        prescriber: {
          id: users.userId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(medications)
      .leftJoin(users, eq(medications.prescribedBy, users.userId))
      .where(and(...whereConditions))
      .orderBy(desc(medications.createdAt))
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: medications.id })
      .from(medications)
      .where(and(...whereConditions));

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        medications: medicationList,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get a single medication by ID
 * GET /api/v0/medications/details/:id
 */
export async function getMedicationById(req, res) {
  try {
    const { id } = req.params;

    const [medicationData] = await db
      .select({
        medication: medications,
        prescriber: {
          id: users.userId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(medications)
      .leftJoin(users, eq(medications.prescribedBy, users.userId))
      .where(eq(medications.id, id));

    if (!medicationData) {
      return res.status(404).json({
        success: false,
        error: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      data: medicationData,
    });
  } catch (error) {
    console.error("Error fetching medication:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Update a medication
 * PUT /api/v0/medications/:id
 */
export async function updateMedication(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    updateData.updatedAt = new Date();

    const [updatedMedication] = await db
      .update(medications)
      .set(updateData)
      .where(eq(medications.id, id))
      .returning();

    if (!updatedMedication) {
      return res.status(404).json({
        success: false,
        error: "Medication not found",
      });
    }

    // If frequency or dates changed, reschedule reminders
    if (updateData.frequency || updateData.startDate || updateData.endDate) {
      try {
        // Delete existing future reminders
        await db
          .delete(medicationReminders)
          .where(
            and(
              eq(medicationReminders.medicationId, id),
              eq(medicationReminders.sent, false)
            )
          );

        // Schedule new reminders
        await scheduleReminders(updatedMedication);
      } catch (reminderError) {
        console.error("Error rescheduling reminders:", reminderError);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedMedication,
      message: "Medication updated successfully",
    });
  } catch (error) {
    console.error("Error updating medication:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Log medication intake (Patient only)
 * POST /api/v0/medications/:id/logs
 */
export async function logMedicationIntake(req, res) {
  try {
    const { id: medicationId } = req.params;
    const { status, takenAt, notes } = req.body;

    // Create medication log
    const [newLog] = await db
      .insert(medicationLogs)
      .values({
        medicationId,
        status,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
        notes,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newLog,
      message: "Medication intake logged successfully",
    });
  } catch (error) {
    console.error("Error logging medication intake:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get medication logs
 * GET /api/v0/medications/:id/logs
 */
export async function getMedicationLogs(req, res) {
  try {
    const { id: medicationId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [eq(medicationLogs.medicationId, medicationId)];

    // Add filters
    if (status) {
      whereConditions.push(eq(medicationLogs.status, status));
    }

    if (startDate) {
      whereConditions.push(gte(medicationLogs.takenAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(medicationLogs.takenAt, new Date(endDate)));
    }

    // Get logs
    const logs = await db
      .select()
      .from(medicationLogs)
      .where(and(...whereConditions))
      .orderBy(desc(medicationLogs.takenAt))
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: medicationLogs.id })
      .from(medicationLogs)
      .where(and(...whereConditions));

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching medication logs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get medication reminders
 * GET /api/v0/medications/:id/reminders
 */
export async function getMedicationReminders(req, res) {
  try {
    const { id: medicationId } = req.params;
    const { page = 1, limit = 10, sent } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [eq(medicationReminders.medicationId, medicationId)];

    // Add filters
    if (sent !== undefined) {
      whereConditions.push(eq(medicationReminders.sent, sent === "true"));
    }

    // Get reminders
    const reminders = await db
      .select()
      .from(medicationReminders)
      .where(and(...whereConditions))
      .orderBy(asc(medicationReminders.remindAt))
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: medicationReminders.id })
      .from(medicationReminders)
      .where(and(...whereConditions));

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        reminders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching medication reminders:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get medication adherence statistics
 * GET /api/v0/medications/:id/adherence
 */
export async function getMedicationAdherence(req, res) {
  try {
    const { id: medicationId } = req.params;
    const { days = 30 } = req.query;

    const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Get logs for the specified period
    const logs = await db
      .select()
      .from(medicationLogs)
      .where(
        and(
          eq(medicationLogs.medicationId, medicationId),
          gte(medicationLogs.takenAt, daysAgo)
        )
      );

    // Calculate statistics
    const totalLogs = logs.length;
    const takenCount = logs.filter(log => log.status === "taken").length;
    const skippedCount = logs.filter(log => log.status === "skipped").length;
    const missedCount = logs.filter(log => log.status === "missed").length;

    const adherenceRate = totalLogs > 0 ? (takenCount / totalLogs) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        totalLogs,
        taken: takenCount,
        skipped: skippedCount,
        missed: missedCount,
        adherenceRate: Math.round(adherenceRate * 100) / 100, // Round to 2 decimal places
      },
    });
  } catch (error) {
    console.error("Error calculating medication adherence:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Delete a medication (Doctor/Admin only)
 * DELETE /api/v0/medications/:id
 */
export async function deleteMedication(req, res) {
  try {
    const { id } = req.params;

    const [deletedMedication] = await db
      .delete(medications)
      .where(eq(medications.id, id))
      .returning();

    if (!deletedMedication) {
      return res.status(404).json({
        success: false,
        error: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medication deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting medication:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
