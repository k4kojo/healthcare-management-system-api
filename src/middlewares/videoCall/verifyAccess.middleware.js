import { db } from "../config/db.js";

export const verifyVideoCallAccess = async (req, res, next) => {
  const { callId } = req.params;
  const { userId } = req.user;

  try {
    const call = await db.query.videoCalls.findFirst({
      where: (calls, { eq, and, or }) =>
        and(
          eq(calls.id, callId),
          or(eq(calls.patientId, userId), eq(calls.doctorId, userId))
        ),
    });

    if (!call) {
      return res.status(404).json({ error: "Call not found or access denied" });
    }

    req.call = call;
    next();
  } catch (error) {
    console.error("Error in verifyVideoCallAccess:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
