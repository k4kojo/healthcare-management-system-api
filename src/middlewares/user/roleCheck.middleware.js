export const restrictToRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: insufficient privileges",
      });
    }
    next();
  };
};

export const preventRoleElevation = (req, res, next) => {
  const { role } = req.user;
  const { role: requestedRole } = req.body;

  // Only admins can change roles
  if (requestedRole && role !== "admin") {
    return res.status(403).json({
      error: "Only admins can change user roles",
    });
  }

  // Prevent non-admins from making themselves admins
  if (requestedRole === "admin" && role !== "admin") {
    return res.status(403).json({
      error: "Cannot elevate to admin role",
    });
  }

  next();
};
