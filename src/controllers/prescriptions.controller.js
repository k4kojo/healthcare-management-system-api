import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { appointments } from "../db/schema/appointments.js";
import { prescriptions } from "../db/schema/prescriptions.js";
import { users } from "../db/schema/users.js";
import { notifications } from "../db/schema/notifications.js";

export const getAllPrescriptions = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(prescriptions);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllPrescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    res.json(req.prescription); // Already fetched by middleware
  } catch (error) {
    console.error("Error in getPrescriptionById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPatientPrescriptions = async (req, res) => {
  try {
    const { userId } = req.user;

    // For patients, get their prescriptions 
    // This includes both appointment-based and direct prescriptions for this patient
    // We need to check multiple sources since direct prescriptions might not have appointments
    
    // Get prescriptions through appointments
    const appointmentPrescriptions = await db
      .select({
        id: prescriptions.id,
        appointmentId: prescriptions.appointmentId,
        doctorId: prescriptions.doctorId,
        medication: prescriptions.medication,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        instructions: prescriptions.instructions,
        fileUrl: prescriptions.fileUrl,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
      })
      .from(prescriptions)
      .innerJoin(
        appointments,
        eq(prescriptions.appointmentId, appointments.appointmentId)
      )
      .where(eq(appointments.patientId, userId));

    // Note: Direct prescriptions would need a patientId field in prescriptions table
    // to be directly queryable. For now, we return appointment-based prescriptions.
    // TODO: Consider adding patientId field to prescriptions table for direct prescriptions

    res.json(appointmentPrescriptions);
  } catch (error) {
    console.error("Error in getPatientPrescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get prescriptions with patient information
    // Handle both appointment-based and direct prescriptions
    const result = await db
      .select({
        // Prescription fields
        id: prescriptions.id,
        appointmentId: prescriptions.appointmentId,
        doctorId: prescriptions.doctorId,
        medication: prescriptions.medication,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        instructions: prescriptions.instructions,
        fileUrl: prescriptions.fileUrl,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        // Patient information from appointments (for appointment-based prescriptions)
        appointmentPatientId: appointments.patientId,
        // Patient information directly (we'll need to find patient for direct prescriptions)
      })
      .from(prescriptions)
      .leftJoin(
        appointments, 
        eq(prescriptions.appointmentId, appointments.appointmentId)
      )
      .where(eq(prescriptions.doctorId, userId))
      .orderBy(prescriptions.createdAt);

    // Now get patient details for each prescription
    const prescriptionsWithPatients = await Promise.all(
      result.map(async (prescription) => {
        let patientInfo = null;
        
        // For appointment-based prescriptions, get patient from appointment
        if (prescription.appointmentPatientId) {
          const [patient] = await db
            .select()
            .from(users)
            .where(eq(users.userId, prescription.appointmentPatientId));
          if (patient) {
            patientInfo = patient;
          }
        } else {
          // For direct prescriptions, find patient through notifications
          console.log(`Looking for patient for prescription ${prescription.id} with medication: ${prescription.medication}`);
          
          // Look for prescription notifications that mention this specific medication and dosage
          const prescriptionNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.type, "prescription"))
            .orderBy(desc(notifications.createdAt));
          
          console.log(`Found ${prescriptionNotifications.length} prescription notifications`);
          
          // Find notification that matches this prescription's details more precisely
          const matchingNotification = prescriptionNotifications.find(notif => 
            notif.message && 
            notif.message.includes(prescription.medication) &&
            notif.message.includes(prescription.dosage) &&
            notif.message.includes(prescription.frequency) &&
            // Check if notification was created around the same time as prescription (within 1 minute)
            Math.abs(new Date(notif.createdAt) - new Date(prescription.createdAt)) < 60000
          );
          
          if (matchingNotification) {
            console.log(`Found matching notification for prescription ${prescription.id}:`, matchingNotification.userId);
            
            if (matchingNotification.userId) {
              const [patient] = await db
                .select()
                .from(users)
                .where(eq(users.userId, matchingNotification.userId));
              if (patient) {
                patientInfo = patient;
                console.log(`Found patient: ${patient.firstName} ${patient.lastName}`);
              } else {
                console.log(`No patient found with userId: ${matchingNotification.userId}`);
              }
            }
          } else {
            console.log(`No matching notification found for prescription ${prescription.id}`);
          }
        }

        return {
          ...prescription,
          patient: patientInfo
        };
      })
    );

    // Format the response to match frontend expectations
    const formattedPrescriptions = prescriptionsWithPatients
      .map(prescription => ({
        id: prescription.id,
        appointmentId: prescription.appointmentId,
        doctorId: prescription.doctorId,
        diagnosis: "Medical Treatment", // Default since we don't have diagnosis in prescriptions table
        medications: [{
          name: prescription.medication,
          dosage: prescription.dosage,
          frequency: prescription.frequency
        }],
        prescribedDate: prescription.createdAt,
        status: "Active", // Default status
        patient: prescription.patient ? {
          id: prescription.patient.userId,
          name: `${prescription.patient.firstName || ''} ${prescription.patient.lastName || ''}`.trim(),
          email: prescription.patient.email,
          profileImage: prescription.patient.profilePicture
        } : {
          id: 'unknown',
          name: 'Unknown Patient',
          email: 'No email available',
          profileImage: null
        },
        // Include original fields for backward compatibility
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        startDate: prescription.startDate,
        endDate: prescription.endDate,
        instructions: prescription.instructions,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt,
        patientName: prescription.patient ? `${prescription.patient.firstName || ''} ${prescription.patient.lastName || ''}`.trim() : 'Unknown Patient',
        patientId: prescription.patient ? prescription.patient.userId : 'unknown'
      }));

    console.log(`Found ${result.length} raw prescriptions for doctor ${userId}`);
    console.log(`Found ${prescriptionsWithPatients.length} prescriptions with patient lookup`);
    console.log(`Returning ${formattedPrescriptions.length} formatted prescriptions`);
    
    res.json(formattedPrescriptions);
  } catch (error) {
    console.error("Error in getDoctorPrescriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const [created] = await db
      .insert(prescriptions)
      .values({
        ...req.body,
        doctorId: req.user.userId, // Ensure prescription is tied to the creating doctor
      })
      .returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error in createPrescription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create prescription from appointment
export const createAppointmentPrescription = async (req, res) => {
  try {
    const { userId: doctorId } = req.user;
    const { appointmentId, diagnosis, medication, dosage, frequency, duration, notes } = req.body;

    console.log("Creating appointment-based prescription:", {
      appointmentId, diagnosis, medication, dosage, frequency, duration
    });

    // Validate required fields
    if (!appointmentId || !diagnosis || !medication || !dosage || !frequency || !duration) {
      return res.status(400).json({ 
        error: "Appointment ID, diagnosis, medication, dosage, frequency, and duration are required" 
      });
    }

    // Verify appointment exists and belongs to doctor
    const appointment = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.appointmentId, appointmentId),
        eq(appointments.doctorId, doctorId)
      ));
    
    if (!appointment.length) {
      return res.status(400).json({ error: "Appointment not found or does not belong to you" });
    }

    const appointmentData = appointment[0];

    // Get patient information
    const patient = await db
      .select()
      .from(users)
      .where(eq(users.userId, appointmentData.patientId));
    
    if (!patient.length) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // Create prescription data
    const prescriptionData = {
      appointmentId,
      doctorId,
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      instructions: notes ? notes.trim() : null,
    };

    // Create prescription
    const [created] = await db
      .insert(prescriptions)
      .values(prescriptionData)
      .returning();

    console.log(`Appointment prescription created successfully with ID: ${created.id}`);
    
    // Create notification for the patient
    try {
      const doctorInfo = await db
        .select()
        .from(users)
        .where(eq(users.userId, doctorId));
      
      const doctorName = doctorInfo.length > 0 
        ? `Dr. ${doctorInfo[0].firstName || ''} ${doctorInfo[0].lastName || ''}`.trim()
        : 'Your doctor';

      await db
        .insert(notifications)
        .values({
          userId: appointmentData.patientId,
          type: 'prescription',
          message: `${doctorName} has prescribed ${medication} (${dosage}, ${frequency}) for ${duration}. Diagnosis: ${diagnosis}. Please check your prescriptions.`,
          isRead: false,
          isGlobal: false,
          emailNotifications: true,
          pushNotifications: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      console.log(`Notification sent to patient ${appointmentData.patientId} for prescription ${created.id}`);
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the prescription creation if notification fails
    }
    
    // Return formatted prescription with patient info
    const formattedPrescription = {
      id: created.id,
      appointmentId,
      patientId: appointmentData.patientId,
      patientName: `${patient[0].firstName || ''} ${patient[0].lastName || ''}`.trim(),
      diagnosis,
      medications: [{
        name: created.medication,
        dosage: created.dosage,
        frequency: created.frequency
      }],
      prescribedDate: created.createdAt,
      status: 'Active',
      patient: {
        id: patient[0].userId,
        name: `${patient[0].firstName || ''} ${patient[0].lastName || ''}`.trim(),
        email: patient[0].email,
        profileImage: patient[0].profilePicture
      },
      // Include original fields for backward compatibility
      medication: created.medication,
      dosage: created.dosage,
      frequency: created.frequency,
      startDate: created.startDate,
      endDate: created.endDate,
      instructions: created.instructions,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      doctorId: created.doctorId
    };

    res.status(201).json(formattedPrescription);
  } catch (error) {
    console.error("Error in createAppointmentPrescription:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};

// New simplified prescription creation endpoint for direct prescriptions
export const createDirectPrescription = async (req, res) => {
  try {
    const { patientId, diagnosis, medication, dosage, frequency, duration, notes } = req.body;
    const { userId: doctorId } = req.user;

    // Validate required fields
    if (!patientId || !diagnosis || !medication || !dosage || !frequency || !duration) {
      return res.status(400).json({ 
        error: "Patient ID, diagnosis, medication, dosage, frequency, and duration are required" 
      });
    }

    // Check if patient exists
    const patient = await db
      .select()
      .from(users)
      .where(eq(users.userId, patientId))
      .where(eq(users.role, "patient"));
    
    if (!patient.length) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // For direct prescriptions, we'll create a prescription without an appointment
    const prescriptionData = {
      doctorId,
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      instructions: notes ? notes.trim() : null,
      appointmentId: null, // No appointment for direct prescriptions
    };

    // Create prescription without appointment validation
    const [created] = await db
      .insert(prescriptions)
      .values(prescriptionData)
      .returning();

    console.log(`Direct prescription created successfully with ID: ${created.id}`);
    
    // Create notification for the patient
    try {
      const doctorInfo = await db
        .select()
        .from(users)
        .where(eq(users.userId, doctorId));
      
      const doctorName = doctorInfo.length > 0 
        ? `Dr. ${doctorInfo[0].firstName || ''} ${doctorInfo[0].lastName || ''}`.trim()
        : 'Your doctor';

      await db
        .insert(notifications)
        .values({
          userId: patientId,
          type: 'prescription',
          message: `${doctorName} has prescribed ${medication} (${dosage}, ${frequency}) for ${duration}. Diagnosis: ${diagnosis}. Please check your prescriptions.`,
          isRead: false,
          isGlobal: false,
          emailNotifications: true,
          pushNotifications: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      console.log(`Notification sent to patient ${patientId} for prescription ${created.id}`);
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the prescription creation if notification fails
    }
    
    // Return formatted prescription with patient info
    const formattedPrescription = {
      id: created.id,
      appointmentId: null,
      patientId,
      patientName: `${patient[0].firstName || ''} ${patient[0].lastName || ''}`.trim(),
      diagnosis,
      medications: [{
        name: created.medication,
        dosage: created.dosage,
        frequency: created.frequency
      }],
      prescribedDate: created.createdAt,
      status: 'Active',
      patient: {
        id: patient[0].userId,
        name: `${patient[0].firstName || ''} ${patient[0].lastName || ''}`.trim(),
        email: patient[0].email,
        profileImage: patient[0].profilePicture
      },
      // Include original fields for backward compatibility
      medication: created.medication,
      dosage: created.dosage,
      frequency: created.frequency,
      startDate: created.startDate,
      endDate: created.endDate,
      instructions: created.instructions,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      doctorId: created.doctorId
    };

    res.status(201).json(formattedPrescription);
  } catch (error) {
    console.error("Error in createDirectPrescription:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const [updated] = await db
      .update(prescriptions)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(prescriptions.id, req.prescription.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updatePrescription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    await db
      .delete(prescriptions)
      .where(eq(prescriptions.id, req.prescription.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deletePrescription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
