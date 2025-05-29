/**
 * User Routes
 *
 * This file contains user profile and account management endpoints:
 * - Get user profile
 * - Update user profile
 * - Delete user account
 * - Get user statistics
 */

import express from "express";
import Joi from "joi";
import User from "../models/User.js";
import { ensureAuthenticated } from "../config/passport.js";

const router = express.Router();

/**
 * Validation Schemas
 */

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required().messages({
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().max(50).required().messages({
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
  profilePicture: Joi.string().uri().allow("", null).messages({
    "string.uri": "Profile picture must be a valid URL",
  }),
});

/**
 * GET /api/user/profile
 * Get current user's profile information
 */
router.get("/profile", ensureAuthenticated, (req, res) => {
  try {
    console.log("👤 Profile request for:", req.user.email);

    // Return user profile (sensitive data is already filtered by toJSON transform)
    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({
      error: "Profile fetch failed",
      message: "An error occurred while fetching your profile",
    });
  }
});

/**
 * PUT /api/user/profile
 * Update current user's profile information
 */
router.put("/profile", ensureAuthenticated, async (req, res) => {
  try {
    console.log("✏️ Profile update request for:", req.user.email);

    // Validate request data
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      console.log(
        "❌ Profile update validation error:",
        error.details[0].message
      );
      return res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
      });
    }

    const { firstName, lastName, profilePicture } = value;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        profilePicture: profilePicture || req.user.profilePicture,
        updatedAt: new Date(),
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validations
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found",
      });
    }

    console.log("✅ Profile updated successfully for:", updatedUser.email);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({
      error: "Profile update failed",
      message: "An error occurred while updating your profile",
    });
  }
});

/**
 * GET /api/user/stats
 * Get user account statistics and information
 */
router.get("/stats", ensureAuthenticated, async (req, res) => {
  try {
    console.log("📊 Stats request for:", req.user.email);

    const user = req.user;

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days since last login
    const daysSinceLastLogin = user.lastLogin
      ? Math.floor(
          (Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    // Get backup codes count (only used ones)
    const usedBackupCodes =
      user.twoFactorAuth.backupCodes?.filter((code) => code.used).length || 0;
    const totalBackupCodes = user.twoFactorAuth.backupCodes?.length || 0;

    const stats = {
      // Account information
      accountAge: accountAge,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      daysSinceLastLogin: daysSinceLastLogin,

      // Authentication information
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,

      // Security information
      twoFactorEnabled: user.twoFactorAuth.isEnabled,
      twoFactorEnabledAt: user.twoFactorAuth.enabledAt,
      backupCodesUsed: usedBackupCodes,
      backupCodesRemaining: totalBackupCodes - usedBackupCodes,

      // Account status
      isActive: user.isActive,
      isLocked: user.isLocked,
      loginAttempts: user.loginAttempts || 0,
    };

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Error fetching user stats:", error);
    res.status(500).json({
      error: "Stats fetch failed",
      message: "An error occurred while fetching your account statistics",
    });
  }
});

/**
 * DELETE /api/user/account
 * Delete user account (soft delete - deactivate account)
 */
router.delete("/account", ensureAuthenticated, async (req, res) => {
  try {
    console.log("🗑️ Account deletion request for:", req.user.email);

    const { confirmEmail } = req.body;

    // Require email confirmation for account deletion
    if (
      !confirmEmail ||
      confirmEmail.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(400).json({
        error: "Confirmation required",
        message: "Please confirm your email address to delete your account",
      });
    }

    // Soft delete - deactivate account instead of hard delete
    const deactivatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        isActive: false,
        updatedAt: new Date(),
        // Anonymize some data for privacy
        firstName: "Deleted",
        lastName: "User",
        profilePicture: null,
      },
      { new: true }
    );

    if (!deactivatedUser) {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found",
      });
    }

    console.log("✅ Account deactivated for:", req.user.email);

    // Logout the user
    req.logout((err) => {
      if (err) {
        console.error("❌ Logout error during account deletion:", err);
        return res.status(500).json({
          error: "Account deletion failed",
          message: "Account was deactivated but logout failed",
        });
      }

      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          console.error(
            "❌ Session destruction error during account deletion:",
            err
          );
        }

        res.json({
          success: true,
          message: "Account deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error("❌ Account deletion error:", error);
    res.status(500).json({
      error: "Account deletion failed",
      message: "An error occurred while deleting your account",
    });
  }
});

/**
 * POST /api/user/reactivate
 * Reactivate a deactivated account (for soft-deleted accounts)
 */
router.post("/reactivate", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Email and password are required",
      });
    }

    console.log("🔄 Account reactivation request for:", email);

    // Find deactivated user
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: false,
    });

    if (!user) {
      return res.status(404).json({
        error: "Account not found",
        message: "No deactivated account found with this email",
      });
    }

    // Verify password for local auth users
    if (user.authProvider === "local") {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid credentials",
          message: "Invalid email or password",
        });
      }
    }

    // Reactivate account
    user.isActive = true;
    user.updatedAt = new Date();
    await user.save();

    console.log("✅ Account reactivated for:", email);

    res.json({
      success: true,
      message: "Account reactivated successfully. You can now log in.",
    });
  } catch (error) {
    console.error("❌ Account reactivation error:", error);
    res.status(500).json({
      error: "Account reactivation failed",
      message: "An error occurred while reactivating your account",
    });
  }
});

/**
 * GET /api/user/sessions
 * Get information about active sessions (simplified for this example)
 */
router.get("/sessions", ensureAuthenticated, (req, res) => {
  try {
    console.log("🔍 Sessions request for:", req.user.email);

    // In a production app, you would track sessions in a database
    // For this example, we'll return basic session info
    const sessionInfo = {
      currentSession: {
        id: req.sessionID,
        createdAt: req.session.cookie.originalMaxAge
          ? new Date(
              Date.now() -
                (req.session.cookie.originalMaxAge - req.session.cookie.maxAge)
            )
          : "Unknown",
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip,
        lastActivity: new Date(),
      },
    };

    res.json({
      success: true,
      sessions: sessionInfo,
    });
  } catch (error) {
    console.error("❌ Error fetching sessions:", error);
    res.status(500).json({
      error: "Sessions fetch failed",
      message: "An error occurred while fetching session information",
    });
  }
});

/**
 * Error handling for this router
 */
router.use((error, req, res, next) => {
  console.error("❌ User route error:", error);
  res.status(500).json({
    error: "User operation failed",
    message: "An unexpected error occurred",
  });
});

export default router;
