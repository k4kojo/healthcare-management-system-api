export const validatePaymentCreation = async (req, res, next) => {
  const { role } = req.user;
  const { userId } = req.body;

  // Patients can only create payments for themselves
  if (role === "patient" && userId !== req.user.userId) {
    return res.status(403).json({
      error: "Patients can only create payments for themselves",
    });
  }

  next();
};

export const restrictPaymentModification = (req, res, next) => {
  const { role } = req.user;
  const { status } = req.body;

  // Only admins can modify completed payments
  if (req.payment?.status === "completed" && role !== "admin") {
    return res.status(403).json({
      error: "Only admins can modify completed payments",
    });
  }

  // Only admins can change payment status
  if (status && role !== "admin") {
    return res.status(403).json({
      error: "Only admins can change payment status",
    });
  }

  next();
};
