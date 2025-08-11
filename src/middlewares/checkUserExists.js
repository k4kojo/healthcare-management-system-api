import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { users } from "../db/schema/users.js";

export const userExists = async (userId) => {
  const [user] = await db.select().from(users).where(eq(users.userId, userId));
  return !!user;
};

export const validateDoctorAndPatientExist = async (req, res, next) => {
  const { doctorId, patientId } = req.body;
  try {
    const doctor = await userExists(doctorId);
    const patient = await userExists(patientId);

    if (!doctor || !patient) {
      return res.status(400).json({ error: "Invalid doctorId or patientId" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateUserExistsByField =
  (fieldName) => async (req, res, next) => {
    try {
      const id = req.body[fieldName];
      const exists = await userExists(id);

      if (!exists) {
        return res.status(400).json({ error: `Invalid ${fieldName}` });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };
