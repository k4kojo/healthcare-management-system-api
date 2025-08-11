export const checkUserSettingsOwnership = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { userId: currentUserId, role } = req.user;

    // Admins can access any settings
    if (role === "admin") return next();

    // Ensure regular users can only access their own settings
    if (userId !== currentUserId) {
      return res.status(403).json({ error: "Unauthorized access to settings" });
    }

    next();
  } catch (error) {
    console.error("User Settings ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};
