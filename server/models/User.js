/**
 * User Model
 *
 * This model defines the structure of user data in MongoDB
 * Supports both regular email/password authentication and Google OAuth
 * Includes fields for Two-Factor Authentication (2FA)
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

/**
 * User Schema Definition
 * Defines all the fields that a user document will have in MongoDB
 */
const userSchema = new Schema(
  {
    // Basic user information
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate emails
      lowercase: true, // Automatically convert to lowercase
      trim: true, // Remove whitespace
      validate: {
        validator: function (email) {
          // Basic email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },

    // For regular authentication (email/password)
    password: {
      type: String,
      required: function () {
        // Password is required only if user is not using OAuth
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator: function (password) {
          // Only validate if password exists (for OAuth users, password might be null)
          if (!password) return true;
          // Password must contain at least one uppercase, one lowercase, and one number
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },

    // User profile information
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    // Full name virtual field (automatically computed)
    // This creates a virtual field that combines firstName and lastName

    // Profile picture URL (for OAuth users or uploaded images)
    profilePicture: {
      type: String,
      default: null,
      validate: {
        validator: function (url) {
          if (!url) return true; // Allow null/empty values
          // Basic URL validation
          return /^https?:\/\/.+/.test(url);
        },
        message: "Profile picture must be a valid URL",
      },
    },

    // Google OAuth specific fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but unique non-null values
    },

    // Authentication provider tracking
    authProvider: {
      type: String,
      enum: ["local", "google"], // Only allow these values
      default: "local",
    },

    // Account status and verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    // Account security
    isActive: {
      type: Boolean,
      default: true, // Account is active by default
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Two-Factor Authentication (2FA) fields
    twoFactorAuth: {
      // Whether 2FA is enabled for this user
      isEnabled: {
        type: Boolean,
        default: false,
      },

      // Secret key for TOTP (Time-based One-Time Password)
      // This is generated when user sets up 2FA
      secret: {
        type: String,
        default: null,
      },

      // Backup codes for 2FA (in case user loses their device)
      backupCodes: [
        {
          code: {
            type: String,
            required: true,
          },
          used: {
            type: Boolean,
            default: false,
          },
          usedAt: {
            type: Date,
            default: null,
          },
        },
      ],

      // When 2FA was first set up
      enabledAt: {
        type: Date,
        default: null,
      },
    },

    // Security and tracking
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    // Password reset functionality
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // Audit trail
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Schema options
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: {
      virtuals: true, // Include virtual fields when converting to JSON
      transform: function (doc, ret) {
        // Remove sensitive fields when sending user data to client
        delete ret.password;
        delete ret.twoFactorAuth.secret;
        delete ret.twoFactorAuth.backupCodes;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual Fields
 * These are computed fields that don't exist in the database
 */

// Add a virtual field for frontend consistency
userSchema.virtual("twoFactorEnabled").get(function () {
  return this.twoFactorAuth.isEnabled;
});

// Add provider virtual field
userSchema.virtual("provider").get(function () {
  return this.authProvider;
});

// Full name virtual field
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Check if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Indexes for Performance
 * These help MongoDB query the data faster
 */
userSchema.index({ email: 1 }); // Index on email for faster lookups
userSchema.index({ googleId: 1 }); // Index on googleId for OAuth lookups
userSchema.index({ createdAt: 1 }); // Index on creation date
userSchema.index({ lastLogin: 1 }); // Index on last login

/**
 * Pre-save Middleware
 * This runs before saving a document to the database
 */
userSchema.pre("save", async function (next) {
  // Only run this if password was modified (or if it's new)
  if (!this.isModified("password")) return next();

  // Don't hash password if it's null (for OAuth users)
  if (!this.password) return next();

  try {
    // Hash password with cost factor of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Instance Methods
 * These are methods that can be called on individual user documents
 */

// Compare provided password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If no password is set (OAuth user), return false
  if (!this.password) return false;

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we're at max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Update last login time
userSchema.methods.updateLastLogin = function () {
  return this.updateOne({
    $set: { lastLogin: new Date() },
  });
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return token; // Return unhashed token to send via email
};

/**
 * Static Methods
 * These are methods that can be called on the User model itself
 */

// Find user by email (case insensitive)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find user by Google ID
userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

// Create user from Google profile
userSchema.statics.createFromGoogleProfile = function (profile) {
  return this.create({
    googleId: profile.id,
    email: profile.emails[0].value,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    profilePicture: profile.photos[0]?.value,
    authProvider: "google",
    isEmailVerified: true, // Google emails are pre-verified
  });
};

/**
 * Create and export the User model
 */
const User = mongoose.model("User", userSchema);

export default User;
