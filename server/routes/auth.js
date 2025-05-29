/**
 * Authentication Routes
 *
 * This file contains all authentication-related endpoints:
 * - User registration (email/password)
 * - User login (email/password)
 * - Google OAuth login
 * - Logout
 * - Password reset
 * - Email verification
 */

import express from "express";
import passport from "passport";
import Joi from "joi";
import User from "../models/User.js";
import {
  ensureAuthenticated,
  redirectIfAuthenticated,
} from "../config/passport.js";

const router = express.Router();

/**
 * Validation Schemas
 * These define the structure and rules for request data
 */

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),
  firstName: Joi.string().trim().max(50).required().messages({
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().max(50).required().messages({
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Registration attempt for:", req.body.email);

    // Validate request data
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log(
        "❌ Registration validation error:",
        error.details[0].message
      );
      return res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
      });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log("❌ Registration failed - user already exists:", email);
      return res.status(409).json({
        error: "User already exists",
        message: "An account with this email address already exists",
      });
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      authProvider: "local",
    });

    await newUser.save();

    console.log("✅ User registered successfully:", email);

    // Automatically log in the user after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error("❌ Auto-login after registration failed:", err);
        return res.status(201).json({
          success: true,
          message: "Registration successful. Please log in.",
          user: newUser.toJSON(),
        });
      }

      console.log("✅ User auto-logged in after registration");
      res.status(201).json({
        success: true,
        message: "Registration and login successful",
        user: newUser.toJSON(),
      });
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      message: "An error occurred during registration. Please try again.",
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password (local strategy)
 */
router.post("/login", (req, res, next) => {
  console.log("🔐 Login attempt for:", req.body.email);

  // Validate request data
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    console.log("❌ Login validation error:", error.details[0].message);
    return res.status(400).json({
      error: "Validation error",
      message: error.details[0].message,
    });
  }

  // Use Passport local strategy for authentication
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("❌ Login authentication error:", err);
      return res.status(500).json({
        error: "Authentication failed",
        message: "An error occurred during login. Please try again.",
      });
    }

    if (!user) {
      console.log("❌ Login failed:", info.message);
      return res.status(401).json({
        error: "Authentication failed",
        message: info.message,
      });
    }

    // Log the user in (create session)
    req.login(user, (err) => {
      if (err) {
        console.error("❌ Session creation error:", err);
        return res.status(500).json({
          error: "Login failed",
          message: "An error occurred during login. Please try again.",
        });
      }

      console.log("✅ Login successful for:", user.email);

      // Check if user has 2FA enabled
      if (user.twoFactorAuth.isEnabled) {
        // Don't mark 2FA as verified yet - user needs to provide TOTP code
        req.session.pendingTwoFactor = true;

        return res.json({
          success: true,
          message: "Login successful. Please provide your 2FA code.",
          requiresTwoFactor: true,
          user: user.toJSON(),
        });
      }

      // No 2FA required - login complete
      res.json({
        success: true,
        message: "Login successful",
        requiresTwoFactor: false,
        user: user.toJSON(),
      });
    });
  })(req, res, next);
});

/**
 * GET /api/auth/google
 * Initiate Google OAuth authentication
 */
router.get("/google", (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      error: "Google OAuth not configured",
      message:
        "Google OAuth authentication is not available. Please contact the administrator.",
    });
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_not_configured`
      );
    }

    passport.authenticate("google", {
      failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
      failureMessage: true,
    })(req, res, next);
  },
  (req, res) => {
    console.log("✅ Google OAuth successful for:", req.user.email);

    // Check if user has 2FA enabled
    if (req.user.twoFactorAuth.isEnabled) {
      // Redirect to 2FA verification page
      req.session.pendingTwoFactor = true;
      return res.redirect(`${process.env.CLIENT_URL}/verify-2fa`);
    }
    // No 2FA required - redirect to dashboard
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

/**
 * POST /api/auth/logout
 * Logout user and destroy session
 */
router.post("/logout", ensureAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  console.log("🚪 Logout request for:", userEmail);

  req.logout((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).json({
        error: "Logout failed",
        message: "An error occurred during logout",
      });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Session destruction error:", err);
        return res.status(500).json({
          error: "Logout failed",
          message: "An error occurred during logout",
        });
      }

      console.log("✅ Logout successful for:", userEmail);
      res.json({
        success: true,
        message: "Logout successful",
      });
    });
  });
});

/**
 * GET /api/auth/status
 * Check current authentication status
 */
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user.toJSON(),
      requiresTwoFactor:
        req.user.twoFactorAuth.isEnabled && !req.session.twoFactorVerified,
      pendingTwoFactor: !!req.session.pendingTwoFactor,
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null,
      requiresTwoFactor: false,
      pendingTwoFactor: false,
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password (for local auth users)
 */
router.post("/change-password", ensureAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Current password and new password are required",
      });
    }

    // Check if user is a local auth user
    if (req.user.authProvider !== "local") {
      return res.status(400).json({
        error: "Invalid operation",
        message:
          "Password change is only available for local authentication users",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: "Invalid password",
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    const passwordSchema = Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required();

    const { error } = passwordSchema.validate(newPassword);
    if (error) {
      return res.status(400).json({
        error: "Invalid password",
        message:
          "New password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    console.log("✅ Password changed for:", req.user.email);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Password change error:", error);
    res.status(500).json({
      error: "Password change failed",
      message: "An error occurred while changing password",
    });
  }
});

/**
 * Error handling for this router
 */
router.use((error, req, res, next) => {
  console.error("❌ Auth route error:", error);
  res.status(500).json({
    error: "Authentication error",
    message: "An unexpected error occurred",
  });
});

export default router;
