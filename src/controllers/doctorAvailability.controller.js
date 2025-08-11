import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { doctorAvailability } from "../db/schema/doctorAvailability.js";

export const getAllDoctorAvailability = async (req, res) => {
  const { role, userId } = req.user;

  try {
    let query = db.select().from(doctorAvailability);

    if (role === "doctor") {
      query = query.where(eq(doctorAvailability.doctorId, userId));
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error("Error in getAllDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDoctorAvailabilityById = async (req, res) => {
  try {
    res.json(req.availability);
  } catch (error) {
    console.error("Error in getDoctorAvailabilityById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createDoctorAvailability = async (req, res) => {
  const { userId, role } = req.user;

  try {
    const data = {
      ...req.body,
      doctorId: role === "admin" ? req.body.doctorId : userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [record] = await db
      .insert(doctorAvailability)
      .values(data)
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const availability = req.availability;

  try {
    const [updated] = await db
      .update(doctorAvailability)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(doctorAvailability.id, Number(id)))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDoctorAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    await db
      .delete(doctorAvailability)
      .where(eq(doctorAvailability.id, Number(id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
