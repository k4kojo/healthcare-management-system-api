import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { JWT_SECRET } from "../config/env.js";
import { users } from "../db/schema.js";

const JWT_ALLOWED_ALGORITHMS = ["HS256", "RS256"];

/**
 * Middleware to authenticate JWT token from Authorization header.
 * Attaches decoded user payload (or full user object from DB) to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined! Check environment variables.");
    return res
      .status(500)
      .json({ error: "Server configuration error: JWT secret missing" });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    { algorithms: JWT_ALLOWED_ALGORITHMS },
    async (err, decodedPayload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ error: "Token expired. Please log in again" });
        }
        if (err.name === "JsonWebTokenError") {
          return res
            .status(403)
            .json({ error: "Invalid token. Access denied" });
        }
        return res
          .status(500)
          .json({ error: "Internal server error during authentication" });
      }

      if (!decodedPayload?.userId) {
        return res.status(403).json({ error: "Invalid token payload" });
      }

      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.userId, decodedPayload.userId));

        if (!user) {
          return res
            .status(401)
            .json({ error: "Unauthorized access: User not found" });
        }

        // Optional: Add checks for user status (e.g., isActive, isVerified)
        // if (!user.isActive) return res.status(401).json({ error: "Your account is inactive" });
        // if (!user.isVerified) return res.status(401).json({ error: "Please verify your email" });

        req.user = { ...user, password: undefined };
        next();
      } catch (error) {
        console.error("Database error during user lookup:", error);
        return res
          .status(500)
          .json({ error: "Internal server error during authentication" });
      }
    }
  );
}

/**
 * Middleware to authorize access based on user roles.
 * Must be used after authenticateToken.
 * @param {...string} allowedRoles - Array of allowed roles (e.g., 'admin', 'doctor', 'patient')
 * @returns {function} Express middleware function
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res
        .status(401)
        .json({ error: "Authentication required for role-based access" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient rights" });
    }

    next();
  };
}
