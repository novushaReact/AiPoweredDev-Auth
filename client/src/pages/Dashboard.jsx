import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  User,
  Calendar,
  Globe,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get("/api/user/stats");
      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccountStatusColor = () => {
    if (!user.isActive) return "text-red-500";
    if (!user.twoFactorEnabled) return "text-yellow-500";
    return "text-green-500";
  };

  const getAccountStatusText = () => {
    if (!user.isActive) return "Inactive";
    if (!user.twoFactorEnabled) return "Partially Secured";
    return "Fully Secured";
  };

  const getAccountStatusIcon = () => {
    if (!user.isActive) return <AlertTriangle className="w-5 h-5" />;
    if (!user.twoFactorEnabled) return <AlertTriangle className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-blue-200 text-lg">
          Manage your account security and view your activity
        </p>
      </div>

      {/* Security Alert */}
      {!user.twoFactorEnabled && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-white p-6 rounded-xl mb-8 animate-slide-up">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Enhance Your Security
              </h3>
              <p className="text-yellow-100 mb-4">
                Your account is not fully protected. Enable two-factor
                authentication to secure your account against unauthorized
                access.
              </p>
              <Link
                to="/2fa-setup"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Enable 2FA Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Account Status */}
        <div className="glass-effect p-6 rounded-xl animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center space-x-2 ${getAccountStatusColor()}`}
            >
              {getAccountStatusIcon()}
              <span className="font-medium">Account Status</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {getAccountStatusText()}
          </div>
          <div className="text-blue-200 text-sm">
            {user.twoFactorEnabled
              ? "All security features enabled"
              : "Security can be improved"}
          </div>
        </div>

        {/* Login Count */}
        <div
          className="glass-effect p-6 rounded-xl animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Activity className="w-5 h-5" />
              <span className="font-medium">Total Logins</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {userStats?.loginCount || 0}
          </div>
          <div className="text-blue-200 text-sm">
            Successful authentications
          </div>
        </div>

        {/* Account Age */}
        <div
          className="glass-effect p-6 rounded-xl animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-green-400">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Member Since</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-blue-200 text-sm">Account created</div>
        </div>

        {/* 2FA Status */}
        <div
          className="glass-effect p-6 rounded-xl animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center space-x-2 ${
                user.twoFactorEnabled ? "text-green-400" : "text-red-400"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">2FA Status</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {user.twoFactorEnabled ? "Enabled" : "Disabled"}
          </div>
          <div className="text-blue-200 text-sm">Two-factor authentication</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Information */}
        <div className="lg:col-span-2">
          <div
            className="glass-effect p-6 rounded-xl animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>Account Information</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    First Name
                  </label>
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                    {user.firstName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    Last Name
                  </label>
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                    {user.lastName}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Email Address
                </label>
                <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                  {user.email}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    Account Type
                  </label>
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white flex items-center space-x-2">
                    {user.provider === "google" ? (
                      <>
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span>Google Account</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-green-400" />
                        <span>Local Account</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    Last Login
                  </label>
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">
                      {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/profile"
                className="bg-white text-purple-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Security Overview */}
        <div className="space-y-6">
          {/* Security Status */}
          <div
            className="glass-effect p-6 rounded-xl animate-slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Overview</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-200">Password Protection</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-200">Email Verification</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-200">Two-Factor Auth</span>
                {user.twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-200">Session Security</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>

            {!user.twoFactorEnabled && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <Link
                  to="/2fa-setup"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Enable 2FA</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="glass-effect p-6 rounded-xl animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <Link
                to="/profile"
                className="block w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 text-white transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Update Profile</span>
                </div>
              </Link>

              {!user.twoFactorEnabled && (
                <Link
                  to="/2fa-setup"
                  className="block w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 text-white transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-yellow-400" />
                    <span>Setup Two-Factor Auth</span>
                  </div>
                </Link>
              )}

              {user.provider === "local" && (
                <Link
                  to="/profile"
                  className="block w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 text-white transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Change Password</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
