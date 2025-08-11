export const validateDoctorPatientRelationship = async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") return next();

    const { appointmentId } = req.body;
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, appointmentId));

    if (!appointment.length || appointment[0].doctorId !== req.user.userId) {
      return res.status(403).json({
        error: "Doctors can only create records for their own appointments",
      });
    }

    next();
  } catch (error) {
    console.error("Doctor-patient relationship validation error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during relationship validation" });
  }
};

export const preventPatientModification = (req, res, next) => {
  if (req.user.role === "patient") {
    return res.status(403).json({
      error: "Patients cannot modify medical records",
    });
  }
  next();
};
