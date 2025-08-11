export const validateReviewCreation = (req, res, next) => {
  const { role } = req.user;

  if (role !== "patient") {
    return res.status(403).json({
      error: "Only patients can create reviews",
    });
  }

  // Ensure patient is creating review for themselves
  if (req.body.patientId && req.body.patientId !== req.user.userId) {
    return res.status(403).json({
      error: "Patients can only create reviews for themselves",
    });
  }

  next();
};

export const restrictReviewModification = (req, res, next) => {
  const { role } = req.user;

  // Only the reviewing patient or admin can modify reviews
  if (role === "doctor" && req.review.patientId !== req.user.userId) {
    return res.status(403).json({
      error: "Doctors cannot modify reviews",
    });
  }

  next();
};
