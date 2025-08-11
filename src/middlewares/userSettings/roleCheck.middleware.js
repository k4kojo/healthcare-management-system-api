export const validateUserSettingsCreation = (req, res, next) => {
  const { role, userId } = req.user;

  // Only allow users to create settings for themselves
  if (req.body.userId && req.body.userId !== userId && role !== "admin") {
    return res.status(403).json({
      error: "Cannot create settings for other users",
    });
  }

  next();
};

export const restrictUserSettingsModification = (req, res, next) => {
  const { role, userId } = req.user;
  const targetUserId = req.params.userId;

  // Only allow admins or the user themselves to modify settings
  if (role !== "admin" && targetUserId !== userId) {
    return res.status(403).json({
      error: "Cannot modify these settings",
    });
  }

  next();
};
