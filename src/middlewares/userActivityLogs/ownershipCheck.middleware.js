import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { userActivityLogs } from "../../db/schema/userActivityLogs.js";

export const checkUserActivityLogOwnership = async (req, res, next) => {
  try {
    const logId = req.params.id;
    const { userId, role } = req.user;

    const log = await db
      .select()
      .from(userActivityLogs)
      .where(eq(userActivityLogs.id, Number(logId)));

    if (!log.length) {
      return res.status(404).json({ error: "Activity log not found" });
    }

    const isOwner = role === "admin" || log[0].userId === userId;

    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to activity log" });
    }

    req.userActivityLog = log[0]; // Attach log to request for later use
    next();
  } catch (error) {
    console.error("User Activity Log ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};

export const checkUserActivityLogsAccess = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    // Admins can access all logs
    if (role === "admin") return next();

    // Ensure regular users can only access their own logs
    if (req.params.userId && req.params.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to activity logs" });
    }

    next();
  } catch (error) {
    console.error("User Activity Logs access check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during access verification" });
  }
};
