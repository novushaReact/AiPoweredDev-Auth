/**
 * Validation Utilities
 *
 * This file contains common validation functions and schemas
 * used throughout the application
 */

import Joi from "joi";

/**
 * Common validation schemas
 */

// Email validation
export const emailSchema = Joi.string().email().required().messages({
  "string.email": "Please provide a valid email address",
  "any.required": "Email is required",
});

// Password validation (strong password)
export const passwordSchema = Joi.string()
  .min(6)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    "string.min": "Password must be at least 6 characters long",
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    "any.required": "Password is required",
  });

// Name validation
export const nameSchema = Joi.string()
  .trim()
  .min(1)
  .max(50)
  .required()
  .messages({
    "string.min": "Name must not be empty",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  });

// 2FA token validation (6 digits)
export const totpTokenSchema = Joi.string()
  .pattern(/^[0-9]{6}$/)
  .required()
  .messages({
    "string.pattern.base": "Token must be exactly 6 digits",
    "any.required": "Token is required",
  });

// Backup code validation (8 characters)
export const backupCodeSchema = Joi.string()
  .pattern(/^[A-F0-9]{8}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Backup code must be 8 uppercase hexadecimal characters",
    "any.required": "Backup code is required",
  });

/**
 * Validation middleware factory
 * Creates middleware to validate request body against a schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
        field: error.details[0].path[0],
      });
    }

    // Replace req.body with validated/sanitized value
    req.body = value;
    next();
  };
}

/**
 * Validation middleware factory for query parameters
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        error: "Validation error",
        message: error.details[0].message,
        field: error.details[0].path[0],
      });
    }

    req.query = value;
    next();
  };
}

/**
 * Utility functions
 */

// Sanitize user input
export function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
}

// Check if email is valid format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if password meets requirements
export function isStrongPassword(password) {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return strongPasswordRegex.test(password);
}

// Generate random string
export function generateRandomString(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default {
  emailSchema,
  passwordSchema,
  nameSchema,
  totpTokenSchema,
  backupCodeSchema,
  validateBody,
  validateQuery,
  sanitizeString,
  isValidEmail,
  isStrongPassword,
  generateRandomString,
};
