/**
 * Multi-Factor Authentication Server
 * Features:
 * - Regular email/password authentication
 * - Google OAuth 2.0 authentication
 * - Two-Factor Authentication (2FA) using TOTP
 * - Session management
 * - Security middleware
 */

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import route handlers
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import twoFactorRoutes from "./routes/twoFactor.js";

// Import middleware
import {
  checkSessionExpiry,
  clear2FAOnSessionExpiry,
} from "./middleware/sessionManagement.js";

// Import passport configuration
import "./config/passport.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Security Middleware Configuration
 * These middlewares help protect against common web vulnerabilities
 */

// Helmet helps secure Express apps by setting various HTTP headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding for OAuth
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * CORS Configuration
 * Allows cross-origin requests from the frontend
 */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean), // Remove any undefined values
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * Body Parser Middleware
 * Parse incoming request bodies
 */
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

/**
 * Session Configuration
 * Used for maintaining user sessions and OAuth state
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost:27017/mfa_auth_db",
      touchAfter: 24 * 3600, // Lazy session update (seconds)
      ttl: 10 * 60 * 60, // 10 hours session expiry in seconds
      crypto: {
        secret: process.env.SESSION_SECRET || "fallback-secret",
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 10 * 60 * 60 * 1000, // 10 hours in milliseconds
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    name: "mfa.sid", // Change default session name for security
  })
);

/**
 * Passport Configuration
 * Initialize passport for authentication
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * MongoDB Connection
 * Connect to MongoDB database
 */
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mfa_auth_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

/**
 * Request Logging Middleware
 * Log all incoming requests for debugging
 */
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`
  );
  next();
});

/**
 * Health Check Endpoint
 * Used to verify if the server is running
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * API Routes
 * Mount all authentication and user-related routes
 */
// Apply session management middleware to protected routes
app.use(clear2FAOnSessionExpiry); // Clear 2FA flags when session expires

app.use("/api/auth", authLimiter, authRoutes); // Authentication routes with rate limiting
app.use("/api/user", checkSessionExpiry, userRoutes); // User profile routes with session check
app.use("/api/2fa", checkSessionExpiry, twoFactorRoutes); // Two-factor authentication routes with session check

/**
 * Welcome Route
 * Basic endpoint to test server connectivity
 */
app.get("/", (req, res) => {
  res.json({
    message: "Multi-Factor Authentication Server is running! 🚀",
    version: "1.0.0",
    features: [
      "Email/Password Authentication",
      "Google OAuth 2.0",
      "Two-Factor Authentication (TOTP)",
      "Session Management",
      "Security Middleware",
    ],
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      user: "/api/user/*",
      twoFactor: "/api/2fa/*",
    },
  });
});

/**
 * 404 Error Handler
 * Handle requests to non-existent routes
 */
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/google",
      "GET /api/auth/google/callback",
      "POST /api/auth/logout",
      "GET /api/user/profile",
      "POST /api/2fa/setup",
      "POST /api/2fa/verify",
      "DELETE /api/2fa/disable",
    ],
  });
});

/**
 * Global Error Handler
 * Handle all unhandled errors
 */
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(error.status || 500).json({
    error: "Internal server error",
    message: isDevelopment ? error.message : "Something went wrong",
    ...(isDevelopment && { stack: error.stack }),
  });
});

/**
 * Graceful Shutdown Handler
 * Handle process termination gracefully
 */
process.on("SIGTERM", () => {
  console.log("📡 SIGTERM received, shutting down gracefully...");

  mongoose.connection.close(() => {
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📡 SIGINT received, shutting down gracefully...");

  mongoose.connection.close(() => {
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  });
});

/**
 * Start Server
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log(`
🚀 Multi-Factor Authentication Server Started!
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📊 Health check: http://localhost:${PORT}/health
🔐 Auth endpoints: http://localhost:${PORT}/api/auth
👤 User endpoints: http://localhost:${PORT}/api/user
🔒 2FA endpoints: http://localhost:${PORT}/api/2fa

⚡ Ready to accept connections!
    `);
});

export default app;
