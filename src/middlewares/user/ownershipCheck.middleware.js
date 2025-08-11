export const checkUserOwnership = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { userId, role } = req.user;

    // Admins can access any user
    if (role === "admin") return next();

    // Ensure regular users can only access their own data
    if (targetUserId !== userId) {
      return res.status(403).json({
        error: "Unauthorized access to user data",
      });
    }

    next();
  } catch (error) {
    console.error("User ownership check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during ownership verification" });
  }
};
