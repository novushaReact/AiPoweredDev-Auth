/**
 * Two-Factor Authentication Routes
 *
 * This file contains all 2FA-related endpoints:
 * - Setup 2FA (generate secret and QR code)
 * - Verify 2FA during setup
 * - Verify 2FA during login
 * - Disable 2FA
 * - Generate backup codes
 * - Use backup codes
 */

import express from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import User from "../models/User.js";
import { ensureAuthenticated } from "../config/passport.js";

const router = express.Router();

/**
 * Utility Functions
 */

/**
 * Generate backup codes for 2FA
 * @param {number} count - Number of backup codes to generate
 * @returns {Array} Array of backup code objects
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString("hex").toUpperCase(),
      used: false,
      usedAt: null,
    });
  }
  return codes;
}

/**
 * POST /api/2fa/setup
 * Generate 2FA secret and QR code for user
 */
router.post("/setup", ensureAuthenticated, async (req, res) => {
  try {
    console.log("🔧 2FA setup request for:", req.user.email);

    // Check if 2FA is already enabled
    if (req.user.twoFactorAuth.isEnabled) {
      return res.status(400).json({
        error: "2FA already enabled",
        message:
          "Two-factor authentication is already enabled for your account",
      });
    }

    // Generate a new secret for this user
    const secret = speakeasy.generateSecret({
      name: `MFA App (${req.user.email})`, // This appears in the authenticator app
      issuer: "MFA Authentication Server", // Your app name
      length: 32, // Length of the secret (32 is recommended)
    });

    // Store the secret temporarily (not yet enabled)
    await User.findByIdAndUpdate(req.user._id, {
      "twoFactorAuth.secret": secret.base32,
      updatedAt: new Date(),
    });

    // Generate QR code for the user to scan
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    console.log("✅ 2FA secret generated for:", req.user.email);

    res.json({
      success: true,
      message:
        "2FA setup initiated. Please scan the QR code with your authenticator app.",
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes: null, // Will be provided after verification
    });
  } catch (error) {
    console.error("❌ 2FA setup error:", error);
    res.status(500).json({
      error: "2FA setup failed",
      message: "An error occurred while setting up two-factor authentication",
    });
  }
});

/**
 * POST /api/2fa/verify-setup
 * Verify the 2FA token during initial setup
 */
router.post("/verify-setup", ensureAuthenticated, async (req, res) => {
  try {
    const { token } = req.body;

    console.log("🔍 2FA setup verification for:", req.user.email);

    if (!token) {
      return res.status(400).json({
        error: "Token required",
        message: "Please provide a 6-digit code from your authenticator app",
      });
    }

    // Get the user's temporary secret
    const user = await User.findById(req.user._id);
    if (!user.twoFactorAuth.secret) {
      return res.status(400).json({
        error: "No setup in progress",
        message: "Please initiate 2FA setup first",
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 step before/after for clock skew
    });

    if (!verified) {
      console.log("❌ Invalid 2FA token during setup for:", req.user.email);
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid. Please try again.",
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Enable 2FA for the user
    await User.findByIdAndUpdate(req.user._id, {
      "twoFactorAuth.isEnabled": true,
      "twoFactorAuth.enabledAt": new Date(),
      "twoFactorAuth.backupCodes": backupCodes,
      updatedAt: new Date(),
    });

    console.log("✅ 2FA enabled successfully for:", req.user.email);

    res.json({
      success: true,
      message: "2FA enabled successfully!",
      backupCodes: backupCodes.map((bc) => bc.code), // Only return the codes, not the full objects
    });
  } catch (error) {
    console.error("❌ 2FA verification error:", error);
    res.status(500).json({
      error: "2FA verification failed",
      message: "An error occurred while verifying your 2FA code",
    });
  }
});

/**
 * POST /api/2fa/verify
 * Verify 2FA token during login or for accessing protected resources
 */
router.post("/verify", ensureAuthenticated, async (req, res) => {
  try {
    const { token, isBackupCode = false } = req.body;

    console.log("🔐 2FA verification attempt for:", req.user.email);

    if (!token) {
      return res.status(400).json({
        error: "Token required",
        message: "Please provide a 6-digit code or backup code",
      });
    }

    // Check if 2FA is enabled
    if (!req.user.twoFactorAuth.isEnabled) {
      return res.status(400).json({
        error: "2FA not enabled",
        message: "Two-factor authentication is not enabled for your account",
      });
    }

    let verified = false;

    if (isBackupCode) {
      // Handle backup code verification
      console.log("🔑 Backup code verification attempt");

      const user = await User.findById(req.user._id);
      const backupCode = user.twoFactorAuth.backupCodes.find(
        (bc) => bc.code === token.toUpperCase() && !bc.used
      );

      if (backupCode) {
        // Mark backup code as used
        backupCode.used = true;
        backupCode.usedAt = new Date();
        await user.save();

        verified = true;
        console.log("✅ Backup code verified for:", req.user.email);
      }
    } else {
      // Handle TOTP verification
      verified = speakeasy.totp.verify({
        secret: req.user.twoFactorAuth.secret,
        encoding: "base32",
        token: token,
        window: 1, // Allow 1 step before/after for clock skew
      });
    }

    if (!verified) {
      console.log("❌ Invalid 2FA token for:", req.user.email);
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided code is invalid or has been used already",
      });
    }

    // Mark 2FA as verified in the session
    req.session.twoFactorVerified = true;
    req.session.pendingTwoFactor = false;

    console.log("✅ 2FA verification successful for:", req.user.email);

    res.json({
      success: true,
      message: "2FA verification successful",
    });
  } catch (error) {
    console.error("❌ 2FA verification error:", error);
    res.status(500).json({
      error: "2FA verification failed",
      message: "An error occurred while verifying your 2FA code",
    });
  }
});

/**
 * DELETE /api/2fa/disable
 * Disable 2FA for the user
 */
router.delete("/disable", ensureAuthenticated, async (req, res) => {
  try {
    const { password, token } = req.body;

    console.log("🔓 2FA disable request for:", req.user.email);

    // Check if 2FA is enabled
    if (!req.user.twoFactorAuth.isEnabled) {
      return res.status(400).json({
        error: "2FA not enabled",
        message: "Two-factor authentication is not enabled for your account",
      });
    }

    // For local auth users, verify password
    if (req.user.authProvider === "local") {
      if (!password) {
        return res.status(400).json({
          error: "Password required",
          message: "Please provide your password to disable 2FA",
        });
      }

      const isPasswordValid = await req.user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid password",
          message: "Password is incorrect",
        });
      }
    }

    // Verify current 2FA token
    if (!token) {
      return res.status(400).json({
        error: "Token required",
        message: "Please provide a current 2FA code to disable 2FA",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorAuth.secret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided 2FA code is invalid",
      });
    }

    // Disable 2FA
    await User.findByIdAndUpdate(req.user._id, {
      "twoFactorAuth.isEnabled": false,
      "twoFactorAuth.secret": null,
      "twoFactorAuth.backupCodes": [],
      "twoFactorAuth.enabledAt": null,
      updatedAt: new Date(),
    });

    // Clear 2FA verification from session
    req.session.twoFactorVerified = false;
    req.session.pendingTwoFactor = false;

    console.log("✅ 2FA disabled for:", req.user.email);

    res.json({
      success: true,
      message: "Two-factor authentication has been disabled",
    });
  } catch (error) {
    console.error("❌ 2FA disable error:", error);
    res.status(500).json({
      error: "2FA disable failed",
      message: "An error occurred while disabling 2FA",
    });
  }
});

/**
 * POST /api/2fa/regenerate-backup-codes
 * Generate new backup codes (invalidates old ones)
 */
router.post(
  "/regenerate-backup-codes",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { token } = req.body;

      console.log("🔄 Backup codes regeneration for:", req.user.email);

      // Check if 2FA is enabled
      if (!req.user.twoFactorAuth.isEnabled) {
        return res.status(400).json({
          error: "2FA not enabled",
          message: "Two-factor authentication is not enabled for your account",
        });
      }

      // Verify current 2FA token
      if (!token) {
        return res.status(400).json({
          error: "Token required",
          message:
            "Please provide a current 2FA code to regenerate backup codes",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: req.user.twoFactorAuth.secret,
        encoding: "base32",
        token: token,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({
          error: "Invalid token",
          message: "The provided 2FA code is invalid",
        });
      }

      // Generate new backup codes
      const newBackupCodes = generateBackupCodes(10);

      await User.findByIdAndUpdate(req.user._id, {
        "twoFactorAuth.backupCodes": newBackupCodes,
        updatedAt: new Date(),
      });

      console.log("✅ Backup codes regenerated for:", req.user.email);

      res.json({
        success: true,
        message: "New backup codes generated successfully",
        backupCodes: newBackupCodes.map((bc) => bc.code),
      });
    } catch (error) {
      console.error("❌ Backup codes regeneration error:", error);
      res.status(500).json({
        error: "Backup codes regeneration failed",
        message: "An error occurred while generating new backup codes",
      });
    }
  }
);

/**
 * GET /api/2fa/status
 * Get 2FA status and backup codes information
 */
router.get("/status", ensureAuthenticated, async (req, res) => {
  try {
    console.log("📊 2FA status request for:", req.user.email);

    const user = await User.findById(req.user._id);

    const status = {
      isEnabled: user.twoFactorAuth.isEnabled,
      enabledAt: user.twoFactorAuth.enabledAt,
      backupCodesCount: user.twoFactorAuth.backupCodes?.length || 0,
      usedBackupCodesCount:
        user.twoFactorAuth.backupCodes?.filter((bc) => bc.used).length || 0,
      isVerifiedInSession: !!req.session.twoFactorVerified,
      pendingTwoFactor: !!req.session.pendingTwoFactor,
    };

    res.json({
      success: true,
      status: status,
    });
  } catch (error) {
    console.error("❌ 2FA status error:", error);
    res.status(500).json({
      error: "2FA status fetch failed",
      message: "An error occurred while fetching 2FA status",
    });
  }
});

/**
 * Error handling for this router
 */
router.use((error, req, res, next) => {
  console.error("❌ 2FA route error:", error);
  res.status(500).json({
    error: "2FA operation failed",
    message: "An unexpected error occurred",
  });
});

export default router;
