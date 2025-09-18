/**
 * Middleware to require specific roles for medication-related operations
 * @param {string[]} roles - Array of allowed roles
 * @returns {function} Express middleware function
 */
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!req.user.role) {
      return res.status(401).json({
        success: false,
        error: "User role not found",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
}

// Predefined role middleware functions
export const requireDoctor = requireRole(["doctor", "admin"]);
export const requirePatient = requireRole(["patient", "admin"]);
export const requireDoctorOrPatient = requireRole(["doctor", "patient", "admin"]);
export const requireAdmin = requireRole(["admin"]);
