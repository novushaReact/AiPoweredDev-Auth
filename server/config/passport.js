/**
 * Passport Configuration
 *
 * This file configures Passport.js for authentication strategies:
 * 1. Local Strategy (email/password authentication)
 * 2. Google OAuth 2.0 Strategy
 *
 * Passport is middleware for Node.js that simplifies authentication
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

/**
 * Serialize User
 * This determines what data from the user object should be stored in the session
 * We only store the user ID to keep the session lightweight
 */
passport.serializeUser((user, done) => {
  console.log("🔒 Serializing user:", user._id);
  done(null, user._id);
});

/**
 * Deserialize User
 * This retrieves the full user object from the database using the ID stored in session
 * This runs on every request where the user is authenticated
 */
passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔓 Deserializing user:", id);
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("❌ Error deserializing user:", error);
    done(error, null);
  }
});

/**
 * Local Strategy Configuration
 * This handles email/password authentication
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Use email instead of username
      passwordField: "password",
      passReqToCallback: false, // We don't need the request object in the callback
    },
    async (email, password, done) => {
      try {
        console.log("🔐 Local authentication attempt for:", email);

        // Find user by email (case insensitive)
        const user = await User.findByEmail(email);

        // Check if user exists
        if (!user) {
          console.log("❌ User not found:", email);
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        // Check if account is locked due to too many failed attempts
        if (user.isLocked) {
          console.log("🔒 Account locked:", email);
          return done(null, false, {
            message:
              "Account temporarily locked due to too many failed login attempts. Please try again later.",
          });
        }

        // Check if account is active
        if (!user.isActive) {
          console.log("🚫 Account inactive:", email);
          return done(null, false, {
            message: "Account has been deactivated. Please contact support.",
          });
        }

        // For Google OAuth users who don't have a password
        if (user.authProvider === "google" && !user.password) {
          console.log("🔗 Google OAuth user attempting local login:", email);
          return done(null, false, {
            message:
              "This account was created with Google. Please sign in with Google.",
          });
        }

        // Compare provided password with stored hash
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
          console.log("❌ Invalid password for:", email);

          // Increment login attempts
          await user.incLoginAttempts();

          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        // Password is correct - reset login attempts and update last login
        await user.resetLoginAttempts();
        await user.updateLastLogin();

        console.log("✅ Local authentication successful for:", email);

        // Return user object (without sensitive data due to toJSON transform)
        return done(null, user);
      } catch (error) {
        console.error("❌ Error in local authentication:", error);
        return done(error);
      }
    }
  )
);

/**
 * Google OAuth 2.0 Strategy Configuration
 * This handles authentication via Google OAuth
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"], // Request access to profile and email
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(
            "🔗 Google OAuth authentication for:",
            profile.emails[0].value
          );
          console.log("📋 Google profile data:", {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });

          // Check if user already exists with this Google ID
          let user = await User.findByGoogleId(profile.id);

          if (user) {
            console.log("✅ Existing Google user found:", user.email);

            // Update last login
            await user.updateLastLogin();

            // Update profile picture if it has changed
            if (
              profile.photos[0]?.value &&
              user.profilePicture !== profile.photos[0].value
            ) {
              user.profilePicture = profile.photos[0].value;
              await user.save();
            }

            return done(null, user);
          }

          // Check if user exists with the same email but different auth provider
          const existingUser = await User.findByEmail(profile.emails[0].value);

          if (existingUser) {
            console.log(
              "🔗 Linking Google account to existing email:",
              existingUser.email
            );

            // Link Google account to existing user
            existingUser.googleId = profile.id;
            existingUser.profilePicture =
              profile.photos[0]?.value || existingUser.profilePicture;
            existingUser.isEmailVerified = true; // Google emails are verified

            await existingUser.save();
            await existingUser.updateLastLogin();

            return done(null, existingUser);
          }

          // Create new user from Google profile
          console.log("👤 Creating new user from Google profile");

          const newUser = await User.createFromGoogleProfile(profile);
          await newUser.updateLastLogin();

          console.log("✅ New Google user created:", newUser.email);

          return done(null, newUser);
        } catch (error) {
          console.error("❌ Error in Google OAuth authentication:", error);
          return done(error);
        }
      }
    )
  );
} else {
  console.log(
    "⚠️  Google OAuth credentials not configured. Google authentication will be disabled."
  );
  console.log(
    "   To enable Google OAuth, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file"
  );
  console.log("   See GOOGLE_OAUTH_SETUP.md for detailed setup instructions");
}

/**
 * Authentication Middleware
 * Helper functions to check authentication status
 */

/**
 * Middleware to ensure user is authenticated
 * Use this to protect routes that require authentication
 */
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("✅ User is authenticated:", req.user.email);
    return next();
  }

  console.log("❌ User not authenticated, redirecting to login");
  res.status(401).json({
    error: "Authentication required",
    message: "Please log in to access this resource",
  });
};

/**
 * Middleware to ensure user has 2FA enabled
 * Use this for routes that require 2FA verification
 */
export const ensure2FA = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }

  if (!req.user.twoFactorAuth.isEnabled) {
    return res.status(403).json({
      error: "2FA required",
      message:
        "Two-factor authentication must be enabled to access this resource",
    });
  }

  // Check if 2FA was verified in this session
  if (!req.session.twoFactorVerified) {
    return res.status(403).json({
      error: "2FA verification required",
      message: "Please verify your two-factor authentication code",
    });
  }

  next();
};

/**
 * Middleware to redirect authenticated users
 * Use this for login/register pages to redirect already logged-in users
 */
export const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
  next();
};

console.log("🔧 Passport configuration loaded successfully");

export default passport;
