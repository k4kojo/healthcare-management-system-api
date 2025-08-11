export const validateNotificationCreation = async (req, res, next) => {
  const { role } = req.user;
  const { isGlobal } = req.body;

  // Only admins can create global notifications
  if (isGlobal && role !== "admin") {
    return res.status(403).json({
      error: "Only admins can create global notifications",
    });
  }

  next();
};

export const preventUserModification = (req, res, next) => {
  if (req.user.role === "patient") {
    return res.status(403).json({
      error: "Patients cannot modify notifications",
    });
  }
  next();
};
