/**
 * Security Middleware
 *
 * This file contains security-related middleware functions
 * to protect the application from common attacks
 */

import rateLimit from "express-rate-limit";

/**
 * Rate Limiting Configurations
 */

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again later.",
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts",
    message:
      "Too many authentication attempts from this IP, please try again later.",
    retryAfter: 15 * 60,
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiting for 2FA endpoints
export const twoFactorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 2FA attempts per windowMs
  message: {
    error: "Too many 2FA attempts",
    message: "Too many 2FA verification attempts, please try again later.",
    retryAfter: 5 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: "Too many password reset attempts",
    message: "Too many password reset requests, please try again later.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security Headers Middleware
 */
export function securityHeaders(req, res, next) {
  // Prevent XSS attacks
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Force HTTPS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Hide server information
  res.removeHeader("X-Powered-By");

  next();
}

/**
 * Request Logging Middleware
 */
export function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  console.log(
    `[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`
  );

  next();
}

/**
 * Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  console.error("❌ Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      message: err.message,
      ...(isDevelopment && { details: err.errors }),
    });
  }

  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID",
      message: "Invalid resource ID provided",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: "Internal server error",
    message: isDevelopment ? err.message : "Something went wrong",
    ...(isDevelopment && { stack: err.stack }),
  });
}

/**
 * Not Found Middleware
 */
export function notFound(req, res) {
  res.status(404).json({
    error: "Not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    method: req.method,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/google",
      "GET /api/auth/google/callback",
      "POST /api/auth/logout",
      "GET /api/auth/status",
      "GET /api/user/profile",
      "PUT /api/user/profile",
      "GET /api/user/stats",
      "POST /api/2fa/setup",
      "POST /api/2fa/verify-setup",
      "POST /api/2fa/verify",
      "DELETE /api/2fa/disable",
      "POST /api/2fa/regenerate-backup-codes",
      "GET /api/2fa/status",
    ],
  });
}

/**
 * CORS Middleware (if not using the cors package)
 */
export function corsMiddleware(req, res, next) {
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
}

/**
 * Session Security Middleware
 */
export function sessionSecurity(req, res, next) {
  // Regenerate session ID on login to prevent session fixation
  if (req.session && req.user && !req.session.regenerated) {
    req.session.regenerate((err) => {
      if (err) {
        console.error("❌ Session regeneration error:", err);
        return next(err);
      }
      req.session.regenerated = true;
      next();
    });
  } else {
    next();
  }
}

/**
 * Input Sanitization Middleware
 */
export function sanitizeInput(req, res, next) {
  // Sanitize request body
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = req.query[key].trim();
      }
    }
  }

  next();
}

export default {
  generalLimiter,
  authLimiter,
  twoFactorLimiter,
  passwordResetLimiter,
  securityHeaders,
  requestLogger,
  errorHandler,
  notFound,
  corsMiddleware,
  sessionSecurity,
  sanitizeInput,
};
