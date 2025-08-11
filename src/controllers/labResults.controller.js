import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { labResults } from "../db/schema/labResults.js";

export const getAllLabResults = async (req, res) => {
  const { role, userId } = req.user;

  try {
    let query = db.select().from(labResults);

    if (role === "doctor") {
      query = query.where(eq(labResults.doctorId, userId));
    } else if (role === "patient") {
      query = query.where(eq(labResults.patientId, userId));
    }

    const results = await query;
    res.json(results);
  } catch (error) {
    console.error("Error in getAllLabResults:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLabResultsById = async (req, res) => {
  try {
    res.json(req.result);
  } catch (error) {
    console.error("Error in getLabResultsById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createLabResults = async (req, res) => {
  const { userId, role } = req.user;

  try {
    const data = {
      ...req.body,
      doctorId: role === "admin" ? req.body.doctorId : userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [record] = await db.insert(labResults).values(data).returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error in createLabResults:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateLabResults = async (req, res) => {
  const { id } = req.params;
  const result = req.result;

  try {
    const [updated] = await db
      .update(labResults)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(labResults.id, Number(id)))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateLabResults:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteLabResults = async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(labResults).where(eq(labResults.id, Number(id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteLabResults:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
