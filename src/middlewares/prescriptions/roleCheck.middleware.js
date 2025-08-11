export const validatePrescriptionCreation = (req, res, next) => {
  const { role } = req.user;

  if (role !== "doctor") {
    return res.status(403).json({
      error: "Only doctors can create prescriptions",
    });
  }

  // Ensure doctor is creating prescription for themselves
  if (req.body.doctorId && req.body.doctorId !== req.user.userId) {
    return res.status(403).json({
      error: "Doctors can only create prescriptions for themselves",
    });
  }

  next();
};

export const restrictPrescriptionModification = (req, res, next) => {
  const { role } = req.user;

  // Only the prescribing doctor can modify their prescriptions
  if (role === "doctor" && req.prescription.doctorId !== req.user.userId) {
    return res.status(403).json({
      error: "Can only modify your own prescriptions",
    });
  }

  next();
};
