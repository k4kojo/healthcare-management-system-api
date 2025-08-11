export const validateUserActivityLogCreation = (req, res, next) => {
  const { role } = req.user;

  // Only admins or system can create logs for other users
  if (
    req.body.userId &&
    req.body.userId !== req.user.userId &&
    role !== "admin"
  ) {
    return res.status(403).json({
      error: "Cannot create activity logs for other users",
    });
  }

  next();
};

export const restrictUserActivityLogModification = (req, res, next) => {
  const { role } = req.user;

  // Only admins can modify logs
  if (role !== "admin") {
    return res.status(403).json({
      error: "Only admins can modify activity logs",
    });
  }

  next();
};
