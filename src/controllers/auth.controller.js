import appleSignin from "apple-signin-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { and, eq, gt, isNotNull } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/db.js";
import { APPLE_CLIENT_ID, GOOGLE_CLIENT_IDS, JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";
import admin from "../config/firebaseAdmin.js";
import { users } from "../db/schema.js";
import notificationService from "../services/notifications/index.js";
import { NotificationType } from "../services/notifications/types.js";

/**
 * Generates a random 6-digit token between 100000 and 999999.
 * @returns {string} The 6-digit token.
 */
const generateSixDigitToken = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Handles user sign-up with enhanced security.
 *
 * This function validates user input, checks for existing users,
 * hashes the password, generates a verification token, and saves the
 * new user to the database.
 */
export const signUp = async (req, res) => {
  try {
    console.log("-> Starting signUp request");
    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, role } = req.body;
    console.log("Checking for existing user with email:", email);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      console.log("User already exists with email:", email);
      return res.status(409).json({ error: "Email already exists" });
    }

    console.log("Creating new user account");
    const userId = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = generateSixDigitToken();
    const hashedVerificationToken = await bcrypt.hash(verificationToken, 8);
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    console.log("Inserting new user into database");
    const [newUser] = await db
      .insert(users)
      .values({
        userId,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        dateOfBirth,
        role,
        verificationToken: hashedVerificationToken,
        verificationTokenExpiry,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Sending verification notification");
    await notificationService.send({
      type: NotificationType.VERIFICATION,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
      token: verificationToken,
      channel: "email",
    });

    if (NODE_ENV === "development") {
      console.log(`Verification token for ${email}: ${verificationToken}`);
    }

    console.log("Generating JWT token");
    const payload = {
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    console.log("<- signUp request successful");
    res.status(201).json({
      message: "User created. Please verify your email.",
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
      token,
      ...(NODE_ENV === "development" && { debugToken: verificationToken }),
    });
  } catch (error) {
    console.error(`Error in signUp: ${error.message}`, {
      stack: error.stack,
      code: error.code,
      body: req.body,
    });
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({
      error: "Internal server error",
      ...(NODE_ENV === "development" && { details: error.message }),
    });
  }
};

/**
 * Handles email verification using a token.
 *
 * This function validates the token provided in the query,
 * checks if it's a valid and unexpired token for a user,
 * and updates the user's `isVerified` status in the database.
 */
export const verifyEmail = async (req, res) => {
  try {
    console.log("-> Starting verifyEmail request");
    const { token, email } = req.query;
    if (!token || !email) {
      return res
        .status(400)
        .json({ error: "Email and verification token required" });
    }

    // Look up the specific user by email with an active verification token
    const candidates = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          isNotNull(users.verificationToken),
          gt(users.verificationTokenExpiry, new Date())
        )
      );

    if (candidates.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = candidates[0];
    const tokenValid = await bcrypt.compare(token, user.verificationToken);
    if (!tokenValid) {
      return res.status(400).json({ error: "Invalid token" });
    }

    await db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, user.userId));

    console.log("<- verifyEmail request successful");
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(`Error in verifyEmail: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Resends a verification email with a new token.
 *
 * This function finds a user by email, generates a new token if the
 * user exists and is not already verified, and updates the user's
 * verification token and expiry date in the database.
 */
export const resendVerification = async (req, res) => {
  try {
    console.log("-> Starting resendVerification request");
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.json({
        message: "If this email exists, a new code will be sent",
      });
    }

    if (user.isVerified) {
      return res.json({ message: "Email already verified" });
    }

    const newToken = generateSixDigitToken();
    const hashedToken = await bcrypt.hash(newToken, 8);
    const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await db
      .update(users)
      .set({
        verificationToken: hashedToken,
        verificationTokenExpiry: newExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, user.userId));

    if (NODE_ENV === "development") {
      console.log(`New verification token for ${email}: ${newToken}`);
    }

    await notificationService.send({
      type: NotificationType.VERIFICATION,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token: newToken,
      channel: "email",
    });
    console.log("<- resendVerification request successful");

    res.json({
      message: "New verification code sent",
      ...(NODE_ENV === "development" && { debugToken: newToken }),
    });
  } catch (error) {
    console.error(`Error in resendVerification: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Handles user sign-in with security checks.
 *
 * This function validates user input, checks for a matching user,
 * verifies the password, confirms the email is verified, and
 * generates a JWT token for the session.
 */
export const signIn = async (req, res) => {
  try {
    console.log("-> Starting signIn request");
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Email not verified" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("<- signIn request successful");
    res.json({
      token,
      user: { ...user, password: undefined },
    });
  } catch (error) {
    console.error(`Error in signIn: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Requests a password reset token for a given email.
 *
 * This function generates a new 4-digit token, hashes it, and
 * stores it with an expiry date for the user, sending the token
 * to the console in development mode.
 */
export const requestPasswordReset = async (req, res) => {
  try {
    console.log("-> Starting requestPasswordReset request");
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.json({
        message: "If this email exists, a reset code will be sent",
      });
    }

    const resetToken = generateSixDigitToken();
    const hashedToken = await bcrypt.hash(resetToken, 8);
    const expiryTime =
      NODE_ENV === "development"
        ? 1000 * 60 * 5 // 5 minutes for development
        : 1000 * 60 * 30; // 30 minutes for production
    const resetTokenExpiry = new Date(Date.now() + expiryTime);

    await db
      .update(users)
      .set({
        resetToken: hashedToken,
        resetTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, user.userId));

    await notificationService.send({
      type: NotificationType.PASSWORD_RESET,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token: resetToken,
      channel: "email",
    });

    if (NODE_ENV === "development") {
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    console.log("<- requestPasswordReset request successful");
    res.json({
      message: "Password reset code sent",
      ...(NODE_ENV === "development" && { debugToken: resetToken }),
    });
  } catch (error) {
    console.error(`Error in requestPasswordReset: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Resets a user's password using a valid reset token.
 *
 * This function validates the provided token, checks for its
 * validity and expiry, and then updates the user's password
 * with the new hashed password.
 */
export const resetPassword = async (req, res) => {
  try {
    console.log("-> Starting resetPassword request");
    const { token, newPassword, email } = req.body;
    if (!token || !newPassword || !email) {
      return res
        .status(400)
        .json({ error: "Email, token and new password required" });
    }

    // Corrected query: Check if the token is not null AND the expiry date is in the future (gt)
    const usersFound = await db
      .select()
      .from(users)
      .where(
        and(
          isNotNull(users.resetToken),
          gt(users.resetTokenExpiry, new Date()),
          eq(users.email, email)
        )
      );

    if (usersFound.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = usersFound[0];
    const tokenValid = await bcrypt.compare(token, user.resetToken);
    if (!tokenValid) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, user.userId));

    console.log("<- resetPassword request successful");
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(`Error in resetPassword: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Verifies a password reset token without changing the password.
 *
 * Expects query params: email and token (or code). Returns 200 if valid.
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { email, token, code } = req.query;
    const provided = token || code;
    if (!email || !provided) {
      return res.status(400).json({ error: "Email and token required" });
    }

    // Find user with active reset token by email
    const usersFound = await db
      .select()
      .from(users)
      .where(
        and(
          isNotNull(users.resetToken),
          gt(users.resetTokenExpiry, new Date()),
          eq(users.email, email)
        )
      );

    if (usersFound.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = usersFound[0];
    const tokenValid = await bcrypt.compare(provided, user.resetToken);
    if (!tokenValid) {
      return res.status(400).json({ error: "Invalid token" });
    }

    return res.json({ message: "Token is valid" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Resends a password reset token.
 *
 * This function finds a user by email and, if found, generates a new
 * password reset token and expiry date.
 */
export const resendResetToken = async (req, res) => {
  try {
    console.log("-> Starting resendResetToken request");
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.json({
        message: "If this email exists, a new code will be sent",
      });
    }

    const newToken = generateSixDigitToken();
    const hashedToken = await bcrypt.hash(newToken, 8);
    const expiryTime =
      NODE_ENV === "development"
        ? 1000 * 60 * 5 // 5 minutes for development
        : 1000 * 60 * 30; // 30 minutes for production
    const newExpiry = new Date(Date.now() + expiryTime);

    await db
      .update(users)
      .set({
        resetToken: hashedToken,
        resetTokenExpiry: newExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, user.userId));

    await notificationService.send({
      type: NotificationType.PASSWORD_RESET,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token: newToken,
      channel: "email",
    });

    if (NODE_ENV === "development") {
      console.log(`New reset token for ${email}: ${newToken}`);
    }

    console.log("<- resendResetToken request successful");
    res.json({
      message: "New password reset code sent",
      ...(NODE_ENV === "development" && { debugToken: newToken }),
    });
  } catch (error) {
    console.error(`Error in resendResetToken: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieves all users from the database (admin only).
 *
 * This function is for administrative access and returns all user
 * data, with the sensitive password field removed.
 */
export const getAllUsers = async (req, res) => {
  try {
    console.log("-> Starting getAllUsers request (Admin access)");
    const allUsers = await db.select().from(users);

    const usersWithoutPasswords = allUsers.map((u) => ({
      ...u,
      password: undefined,
    }));

    console.log("<- getAllUsers request successful");
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error(`Error in getAllUsers: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieves a single user by their ID.
 *
 * This function finds and returns a user based on the `userId` provided
 * in the request parameters, removing the password field.
 */
export const getUserById = async (req, res) => {
  try {
    console.log("-> Starting getUserById request");
    const { id } = req.params;

    const user = await db.select().from(users).where(eq(users.userId, id));

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userWithoutPassword = { ...user[0], password: undefined };
    console.log("<- getUserById request successful");
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(`Error in getUserById: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates a user's information by their ID.
 *
 * This function updates specified user fields based on the request body.
 * It includes a security check suggestion and removes sensitive fields
 * from being updated.
 */
export const updateUserById = async (req, res) => {
  try {
    console.log("-> Starting updateUserById request");
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, dateOfBirth, profilePicture } = req.body;
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.userId, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("<- updateUserById request successful");
    res.json({
      message: "User updated successfully",
      user: { ...result[0], password: undefined },
    });
  } catch (error) {
    console.error(`Error in updateUserById: ${error.message}`, {
      stack: error.stack,
      code: error.code,
    });
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Deletes a user by their ID.
 *
 * This function removes a user from the database based on the `userId`
 * provided in the request parameters. It includes a suggestion for
 * implementing robust security checks.
 */
export const deleteUserById = async (req, res) => {
  try {
    console.log("-> Starting deleteUserById request");
    const { id } = req.params;

    const result = await db
      .delete(users)
      .where(eq(users.userId, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("<- deleteUserById request successful");
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteUserById: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---- OAuth Providers ----

const parseGoogleClientIds = () => {
  if (!GOOGLE_CLIENT_IDS) return [];
  try {
    return JSON.parse(GOOGLE_CLIENT_IDS);
  } catch {
    return [];
  }
};

const googleClients = parseGoogleClientIds().map((cid) => new OAuth2Client(cid));

export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body; // Google ID token from client
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    // Verify against any configured client id
    let payload = null;
    for (const client of googleClients) {
      try {
        const ticket = await client.verifyIdToken({ idToken, audience: client._clientId });
        payload = ticket.getPayload();
        break;
      } catch {}
    }
    if (!payload) return res.status(401).json({ error: "Invalid Google token" });

    const email = payload.email;
    if (!email) return res.status(400).json({ error: "Google account has no email" });

    let [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      const userId = uuidv4();
      const [created] = await db
        .insert(users)
        .values({
          userId,
          firstName: payload.given_name || "",
          lastName: payload.family_name || "",
          email,
          password: await bcrypt.hash(uuidv4(), 8),
          phoneNumber: "",
          isVerified: true,
          role: "patient",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      user = created;
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: "Google sign-in failed" });
  }
};

export const appleSignIn = async (req, res) => {
  try {
    const { identityToken } = req.body; // Apple identity token (JWT)
    if (!identityToken) return res.status(400).json({ error: "Missing identityToken" });

    const decoded = await appleSignin.verifyIdToken(identityToken, {
      audience: APPLE_CLIENT_ID,
    });

    const email = decoded.email || req.body.email; // Apple might redact email
    if (!email) return res.status(400).json({ error: "Apple account has no email" });

    let [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      const userId = uuidv4();
      const [created] = await db
        .insert(users)
        .values({
          userId,
          firstName: req.body.firstName || "",
          lastName: req.body.lastName || "",
          email,
          password: await bcrypt.hash(uuidv4(), 8),
          phoneNumber: "",
          isVerified: true,
          role: "patient",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      user = created;
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: "Apple sign-in failed" });
  }
};

/**
 * Issues a Firebase custom auth token for the currently authenticated backend user.
 * Requires JWT auth middleware to have populated req.user.
 */
export const getFirebaseCustomToken = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const additionalClaims = { role: user.role || "patient" };
    const customToken = await admin.auth().createCustomToken(user.userId, additionalClaims);
    return res.json({ customToken });
  } catch (error) {
    console.error("Error creating Firebase custom token:", error);
    return res.status(500).json({ error: "Failed to create Firebase custom token" });
  }
};

/**
 * Creates a new user account by admin (admin only).
 * This function allows admins to create user accounts, particularly doctors,
 * without requiring email verification.
 */
export const createUserByAdmin = async (req, res) => {
  try {
    console.log("-> Starting createUserByAdmin request");
    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, role } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ 
        error: "firstName, lastName, email, password, phoneNumber, and role are required" 
      });
    }

    // Validate role
    const validRoles = ['patient', 'doctor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: "Invalid role. Must be one of: patient, doctor, admin" 
      });
    }

    console.log("Checking for existing user with email:", email);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      console.log("User already exists with email:", email);
      return res.status(409).json({ error: "Email already exists" });
    }

    console.log("Creating new user account by admin");
    const userId = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Inserting new user into database");
    const [newUser] = await db
      .insert(users)
      .values({
        userId,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        dateOfBirth,
        role,
        isVerified: true, // Admin-created users are automatically verified
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("<- createUserByAdmin request successful");
    res.status(201).json({
      message: "User created successfully by admin",
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        isVerified: newUser.isVerified,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error(`Error in createUserByAdmin: ${error.message}`, {
      stack: error.stack,
      code: error.code,
      body: req.body,
    });
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({
      error: "Internal server error",
      ...(NODE_ENV === "development" && { details: error.message }),
    });
  }
};
