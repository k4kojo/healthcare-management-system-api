import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { patientProfiles, users } from "../db/schema.js";

export const getMyPatientProfile = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser?.userId) return res.status(401).json({ error: "Unauthorized" });

    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, authUser.userId));

    const safeUser = { ...authUser };
    delete safeUser.password;

    return res.json({ user: safeUser, profile: profile || null });
  } catch (error) {
    console.error("getMyPatientProfile error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const upsertMyPatientProfile = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser?.userId) return res.status(401).json({ error: "Unauthorized" });

    const { firstName, lastName, email, phoneNumber, dateOfBirth, ...rest } = req.body;

    if (
      firstName !== undefined ||
      lastName !== undefined ||
      email !== undefined ||
      phoneNumber !== undefined ||
      dateOfBirth !== undefined
    ) {
      const updates = { updatedAt: new Date() };
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (email !== undefined) updates.email = email;
      if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
      if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
      await db.update(users).set(updates).where(eq(users.userId, authUser.userId));
    }

    const [existing] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, authUser.userId));

    if (existing) {
      const [updated] = await db
        .update(patientProfiles)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(patientProfiles.userId, authUser.userId))
        .returning();
      return res.json({ message: "Profile updated", profile: updated });
    }

    const [created] = await db
      .insert(patientProfiles)
      .values({ userId: authUser.userId, ...rest, createdAt: new Date(), updatedAt: new Date() })
      .returning();

    return res.status(201).json({ message: "Profile created", profile: created });
  } catch (error) {
    console.error("upsertMyPatientProfile error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


