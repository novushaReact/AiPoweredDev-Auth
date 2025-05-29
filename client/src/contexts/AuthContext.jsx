import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/status");
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log("Not authenticated");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, twoFactorCode = null) => {
    try {
      setError(null);
      const response = await axios.post("/api/auth/login", {
        email,
        password,
        twoFactorCode,
      });

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        requiresTwoFactor: error.response?.data?.requiresTwoFactor,
      };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post("/api/auth/register", userData);

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await axios.put("/api/user/profile", profileData);

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const enableTwoFactor = async () => {
    try {
      setError(null);
      const response = await axios.post("/api/2fa/enable");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "2FA setup failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyTwoFactor = async (token) => {
    try {
      setError(null);
      const response = await axios.post("/api/2fa/verify", { token });

      if (response.data.success) {
        // Refresh user data to get updated 2FA status
        await checkAuthStatus();
        return response.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "2FA verification failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const disableTwoFactor = async (password) => {
    try {
      setError(null);
      const response = await axios.post("/api/2fa/disable", { password });

      if (response.data.success) {
        await checkAuthStatus();
        return response.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "2FA disable failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await axios.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password change failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    changePassword,
    checkAuthStatus,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
