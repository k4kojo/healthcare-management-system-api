import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { users } from "../db/schema/users.js";

export const checkUserExists = async (userId) => {
  const user = await db.select().from(users).where(eq(users.userId, userId));
  return user.length > 0;
};

// export const validateDoctorId = async (doctorId) => {
//   const [user] = await db.select().from(users).where(eq(users.userId, doctorId));
//   if (!user) return false;
//   return user.role === "doctor";
// };

export const verifyDoctorExists = async (doctorId) => {
  const doctor = await db
    .select()
    .from(users)
    .where(eq(users.userId, doctorId));
  return doctor.length > 0;
};
