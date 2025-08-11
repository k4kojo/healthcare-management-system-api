import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users } from "../../db/schema/users.js";

export const validateDoctorUser = async (req, res, next) => {
  const { doctorId } = req.body;
  const { userId, role } = req.user;

  try {
    // For doctors creating their own profile
    if (role === "doctor" && (!doctorId || doctorId === userId)) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId));

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      if (user.role !== "doctor") {
        return res.status(400).json({ error: "User is not a doctor" });
      }
      return next();
    }

    // For admins creating profiles for other doctors
    if (role === "admin" && doctorId) {
      const [doctor] = await db
        .select()
        .from(users)
        .where(eq(users.userId, doctorId));

      if (!doctor) {
        return res.status(400).json({ error: "Doctor not found" });
      }
      if (doctor.role !== "doctor") {
        return res.status(400).json({ error: "User is not a doctor" });
      }
      return next();
    }

    return res.status(400).json({ error: "Invalid doctor ID" });
  } catch (error) {
    console.error("Error in validateDoctorUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
