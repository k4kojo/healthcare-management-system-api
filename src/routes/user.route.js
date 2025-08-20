import { Router } from "express";
import {
  appleSignIn,
  createUserByAdmin,
  deleteUserById,
  getAllUsers,
  getFirebaseCustomToken,
  getUserById,
  googleSignIn,
  requestPasswordReset,
  resendResetToken,
  resendVerification,
  resetPassword,
  signIn,
  signUp,
  updateUserById,
  verifyEmail,
  verifyResetToken,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { checkUserOwnership } from "../middlewares/user/ownershipCheck.middleware.js";
import {
  preventRoleElevation,
  restrictToRoles,
} from "../middlewares/user/roleCheck.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { adminUserCreationSchema, signInSchema, signUpSchema } from "../validators/authSchema.js";

const userRouter = Router();

// Public routes
userRouter.post("/sign-up", validateBody(signUpSchema), signUp);
userRouter.get("/verify-email", verifyEmail);
userRouter.get("/resend-verification", resendVerification);
userRouter.post("/sign-in", validateBody(signInSchema), signIn);
userRouter.post("/oauth/google", googleSignIn);
userRouter.post("/oauth/apple", appleSignIn);

// Protected routes
userRouter.get("/", authenticateToken, restrictToRoles("admin"), getAllUsers);

// Admin-only user creation
userRouter.post("/create", authenticateToken, restrictToRoles("admin"), validateBody(adminUserCreationSchema), createUserByAdmin);

// Issue Firebase custom token for authenticated user
userRouter.get(
  "/firebase-token",
  authenticateToken,
  getFirebaseCustomToken
);

userRouter.get("/:id", authenticateToken, checkUserOwnership, getUserById);

userRouter.put(
  "/:id",
  authenticateToken,
  checkUserOwnership,
  preventRoleElevation,
  updateUserById
);

userRouter.delete(
  "/:id",
  authenticateToken,
  checkUserOwnership,
  deleteUserById
);

userRouter.post("/request-password-reset", requestPasswordReset);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/resend-request-password-reset", resendResetToken);
userRouter.get("/verify-reset-token", verifyResetToken);

export default userRouter;
