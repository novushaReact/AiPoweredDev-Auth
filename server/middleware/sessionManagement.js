/**
 * Session Management Middleware
 * Handles session expiry and 2FA requirements
 */

/**
 * Middleware to check session expiry and require full re-authentication
 * Including username, password, and MFA after 10 hours
 */
export const checkSessionExpiry = (req, res, next) => {
  if (req.isAuthenticated()) {
    const now = new Date();
    const sessionCreatedAt = req.session.cookie._expires
      ? new Date(req.session.cookie._expires.getTime() - 10 * 60 * 60 * 1000)
      : new Date(req.session.passport?.user?.loginTime || now);

    const tenHours = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
    const timeSinceLogin = now.getTime() - sessionCreatedAt.getTime();

    // If session is older than 10 hours, require full re-authentication
    if (timeSinceLogin > tenHours) {
      console.log(
        "🕐 Session expired after 10 hours, requiring full re-authentication"
      );

      // Clear the session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying expired session:", err);
        }
      });

      // Send appropriate response based on request type
      if (req.path.startsWith("/api/")) {
        return res.status(401).json({
          error: "Session expired",
          message:
            "Your session has expired. Please log in again with your username, password, and MFA.",
          requiresFullAuth: true,
        });
      } else {
        return res.redirect("/login?reason=session_expired");
      }
    }

    // If user has 2FA enabled but hasn't completed 2FA verification in this session
    if (req.user.twoFactorAuth.isEnabled && !req.session.twoFactorVerified) {
      console.log("🔐 2FA required for authenticated user");

      if (req.path.startsWith("/api/")) {
        return res.status(401).json({
          error: "2FA required",
          message:
            "Two-factor authentication required to access this resource.",
          requiresTwoFactor: true,
        });
      } else {
        return res.redirect("/verify-2fa");
      }
    }
  }

  next();
};

/**
 * Middleware to update session login time on successful authentication
 */
export const updateLoginTime = (req, res, next) => {
  if (req.isAuthenticated() && !req.session.loginTime) {
    req.session.loginTime = new Date();
    console.log("✅ Session login time updated:", req.session.loginTime);
  }
  next();
};

/**
 * Middleware to clear 2FA verification when session expires or user is not authenticated
 */
export const clear2FAOnSessionExpiry = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Clear 2FA verification flags when user is not authenticated
    if (req.session && (req.session.twoFactorVerified || req.session.pendingTwoFactor)) {
      req.session.twoFactorVerified = false;
      req.session.pendingTwoFactor = false;
      console.log("🔓 Cleared 2FA verification due to unauthenticated state");
    }
  }
  next();
};
