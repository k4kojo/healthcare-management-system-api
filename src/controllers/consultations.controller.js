import { and, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { appointments } from "../db/schema/appointments.js";
import { doctorProfile } from "../db/schema/doctorProfile.js";
import { users } from "../db/schema/users.js";

export const getAllConsultations = async (req, res) => {
  const { role, userId } = req.user;
  const { status, doctorId, patientId } = req.query;

  try {
    console.log("➡️  getAllConsultations called with role:", role);
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

    console.log("📦 Fetching consultations...");
    const result = await db
      .select({
        // consultation/appointment fields
        consultationId: appointments.appointmentId,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        consultationDate: appointments.appointmentDate,
        consultationMode: appointments.appointmentMode,
        reasonForVisit: appointments.reasonForVisit,
        consultationAmount: appointments.appointmentAmount,
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

    console.log(`✅ Fetched ${result.length} consultations`);
    res.json(result);
  } catch (error) {
    console.error("❌ Error in getAllConsultations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("➡️  getConsultationById:", id);
    
    const consultation = await db
      .select({
        consultationId: appointments.appointmentId,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        consultationDate: appointments.appointmentDate,
        consultationMode: appointments.appointmentMode,
        reasonForVisit: appointments.reasonForVisit,
        consultationAmount: appointments.appointmentAmount,
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
      .where(eq(appointments.appointmentId, id));

    if (consultation.length === 0) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    res.json(consultation[0]);
  } catch (error) {
    console.error("❌ Error in getConsultationById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createConsultation = async (req, res) => {
  const { role, userId } = req.user;
  let body = req.body;

  console.log("➡️  createConsultation called by", role);

  if (role === "patient") {
    console.log("🧾 Setting patientId to self:", userId);
    body = { ...body, patientId: userId };
  }

  try {
    const [consultation] = await db
      .insert(appointments)
      .values({
        ...body,
        appointmentId: body.consultationId || body.appointmentId,
        appointmentDate: body.consultationDate || body.appointmentDate,
        appointmentMode: body.consultationMode || body.appointmentMode,
        appointmentAmount: body.consultationAmount || body.appointmentAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Created consultation:", consultation.appointmentId);
    res.status(201).json(consultation);
  } catch (error) {
    console.error("❌ Error in createConsultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateConsultation = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    console.log("➡️  updateConsultation:", id);
    
    const [updated] = await db
      .update(appointments)
      .set({
        ...updateData,
        appointmentDate: updateData.consultationDate || updateData.appointmentDate,
        appointmentMode: updateData.consultationMode || updateData.appointmentMode,
        appointmentAmount: updateData.consultationAmount || updateData.appointmentAmount,
        updatedAt: new Date(),
      })
      .where(eq(appointments.appointmentId, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    console.log("✅ Updated consultation:", id);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error in updateConsultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteConsultation = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("➡️  deleteConsultation:", id);
    
    const [deleted] = await db
      .delete(appointments)
      .where(eq(appointments.appointmentId, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    console.log("✅ Deleted consultation:", id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Error in deleteConsultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const startConsultation = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("➡️  startConsultation:", id);
    
    const [updated] = await db
      .update(appointments)
      .set({
        status: "in-progress",
        updatedAt: new Date(),
      })
      .where(eq(appointments.appointmentId, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    console.log("✅ Started consultation:", id);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error in startConsultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const endConsultation = async (req, res) => {
  const { id } = req.params;
  const { notes, diagnosis } = req.body;

  try {
    console.log("➡️  endConsultation:", id);
    
    const [updated] = await db
      .update(appointments)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(appointments.appointmentId, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    console.log("✅ Ended consultation:", id);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error in endConsultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelConsultation = async (req, res) => {
  const { id } = req.params;
  const { cancelReason } = req.body;

  try {
    console.log("➡️  cancelConsultation:", id);
    
    const [updated] = await db
      .update(appointments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(appointments.appointmentId, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    console.log("✅ Cancelled consultation:", id);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error in cancelConsultation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
