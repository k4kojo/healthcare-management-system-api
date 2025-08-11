export const validateUserFeedbackCreation = (req, res, next) => {
  const { role } = req.user;

  // Only allow users to create feedback for themselves
  if (req.body.userId && req.body.userId !== req.user.userId) {
    return res.status(403).json({
      error: "Cannot create feedback for other users",
    });
  }

  next();
};

export const restrictUserFeedbackModification = (req, res, next) => {
  const { role } = req.user;

  // Only allow admins or the feedback owner to modify
  if (role !== "admin" && req.userFeedback.userId !== req.user.userId) {
    return res.status(403).json({
      error: "Cannot modify this feedback",
    });
  }

  next();
};
