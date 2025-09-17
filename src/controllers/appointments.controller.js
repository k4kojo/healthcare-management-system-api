import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { appointments } from "../db/schema/appointments.js";
import { doctorProfile } from "../db/schema/doctorProfile.js";
import { notifications } from "../db/schema/notifications.js";
import { users } from "../db/schema/users.js";
import { appointmentSchema } from "../validators/appointmentsSchema.js";

export const getAllAppointments = async (req, res) => {
  const { role, userId } = req.user;
  const { status, doctorId, patientId } = req.query;

  try {
    console.log("➡️  getAllAppointments called with role:", role);
    let conditions = [];

    if (role === "doctor") {
      console.log("🔐 Restricting results to doctor:", userId);
      conditions.push(eq(appointments.doctorId, userId));
    } else if (role === "patient") {
      console.log("🔐 Restricting results to patient:", userId);
      conditions.push(eq(appointments.patientId, userId));
    } else if (role !== "admin") {
      console.warn("🚫 Forbidden: Non-admin/non-owner trying to access");
      return res.status(403).json({ error: "Forbidden" });
    }

    if (status) {
      console.log("🔍 Filtering by status:", status);
      conditions.push(eq(appointments.status, status));
    }
    if (doctorId && role === "admin") {
      console.log("🔍 Admin filtering by doctorId:", doctorId);
      conditions.push(eq(appointments.doctorId, doctorId));
    }
    if (patientId && role === "admin") {
      console.log("🔍 Admin filtering by patientId:", patientId);
      conditions.push(eq(appointments.patientId, patientId));
    }

    console.log("📦 Fetching appointments...");
    // We need to get patient info separately since we can't join users table twice
    const appointmentsWithDoctor = await db
      .select({
        // appointment fields
        appointmentId: appointments.appointmentId,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        appointmentDate: appointments.appointmentDate,
        appointmentMode: appointments.appointmentMode,
        reasonForVisit: appointments.reasonForVisit,
        appointmentAmount: appointments.appointmentAmount,
        paidAmount: appointments.paidAmount,
        paymentMethod: appointments.paymentMethod,
        paymentStatus: appointments.paymentStatus,
        paymentDate: appointments.paymentDate,
        status: appointments.status,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        // joined doctor fields
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorEmail: users.email,
        doctorPhoneNumber: users.phoneNumber,
        doctorSpecialization: doctorProfile.specialization,
      })
      .from(appointments)
      .leftJoin(users, eq(users.userId, appointments.doctorId))
      .leftJoin(doctorProfile, eq(doctorProfile.doctorId, users.userId))
      .where(conditions.length ? and(...conditions) : undefined);

    // Get patient information for each appointment
    const result = await Promise.all(
      appointmentsWithDoctor.map(async (appointment) => {
        const [patient] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phoneNumber: users.phoneNumber,
          })
          .from(users)
          .where(eq(users.userId, appointment.patientId));

        return {
          ...appointment,
          patientFirstName: patient?.firstName,
          patientLastName: patient?.lastName,
          patientEmail: patient?.email,
          patientPhoneNumber: patient?.phoneNumber,
        };
      })
    );

    console.log(`✅ Fetched ${result.length} appointments`);
    res.json(result);
  } catch (error) {
    console.error("❌ Error in getAllAppointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    console.log("➡️  getAppointmentById:", req.appointment?.appointmentId);
    res.json(req.appointment);
  } catch (error) {
    console.error("❌ Error in getAppointmentById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createAppointment = async (req, res) => {
  const { role, userId } = req.user;
  let body = req.body;

  console.log("➡️  createAppointment called by", role);

  if (role === "patient") {
    console.log("🧾 Setting patientId to self:", userId);
    body = { ...body, patientId: userId };
  }

  if (role === "admin" && !body.patientId) {
    console.warn("⚠️  Admin did not provide patientId");
    return res.status(400).json({ error: "patientId is required for admin" });
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    console.warn("❌ Input validation failed:", parsed.error.errors);
    return res.status(400).json({ error: parsed.error.errors });
  }

  try {
    console.log("🛠 Inserting appointment...");
    const [appointment] = await db
      .insert(appointments)
      .values({
        ...parsed.data,
        appointmentId: crypto.randomUUID(),
        status: "pending",
      })
      .returning();

    console.log("✅ Appointment created with ID:", appointment.appointmentId);
    // Create in-app notifications for patient, doctor, and admin
    try {
      const when = new Date(appointment.appointmentDate);
      const humanWhen = isNaN(when.getTime())
        ? String(appointment.appointmentDate)
        : `${when.toDateString()} ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

      const notificationsToCreate = [
        // Notification for patient
        {
          userId: appointment.patientId,
          type: "appointment",
          message: `Your appointment request has been submitted for ${humanWhen}.`,
          isGlobal: false,
        }
      ];

      // Notification for doctor if specified
      if (appointment.doctorId) {
        notificationsToCreate.push({
          userId: appointment.doctorId,
          type: "appointment",
          message: `New appointment request received for ${humanWhen}.`,
          isGlobal: false,
        });
      }

      // Global notification for admin
      notificationsToCreate.push({
        userId: null,
        type: "appointment",
        message: `New appointment booked for ${humanWhen}.`,
        isGlobal: true,
      });

      await db.insert(notifications).values(notificationsToCreate);
      console.log(`✅ Created ${notificationsToCreate.length} notifications for appointment`);
    } catch (notifyErr) {
      console.warn("⚠️ Failed to create notification for appointment:", notifyErr);
    }
    res.status(201).json(appointment);
  } catch (error) {
    console.error("❌ Error in createAppointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;
  const appointment = req.appointment;

  console.log("➡️  updateAppointment called for ID:", id);

  if (role !== "admin" && userId !== appointment.doctorId) {
    console.warn("🚫 Unauthorized update attempt by user:", userId);
    return res.status(403).json({ error: "Unauthorized update" });
  }

  const parsed = appointmentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    console.warn("❌ Input validation failed:", parsed.error.errors);
    return res.status(400).json({ error: parsed.error.errors });
  }

  try {
    console.log("🛠 Updating appointment...");
    const [updated] = await db
      .update(appointments)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(appointments.appointmentId, id))
      .returning();

    console.log("✅ Appointment updated:", updated.appointmentId);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error in updateAppointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;
  const appointment = req.appointment;

  console.log("➡️  deleteAppointment called for ID:", id);

  if (role !== "admin" && userId !== appointment.doctorId) {
    console.warn("🚫 Unauthorized delete attempt by user:", userId);
    return res.status(403).json({ error: "Unauthorized delete" });
  }

  try {
    console.log("🗑 Deleting appointment...");
    await db.delete(appointments).where(eq(appointments.appointmentId, id));
    console.log("✅ Appointment deleted:", id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Error in deleteAppointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
