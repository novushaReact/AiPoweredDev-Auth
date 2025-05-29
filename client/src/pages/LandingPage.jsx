import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  Lock,
  Key,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Multi-Factor Authentication",
      description:
        "Secure your account with TOTP-based 2FA using apps like Google Authenticator",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Advanced Security",
      description:
        "Rate limiting, account locking, and session management for maximum protection",
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: "OAuth Integration",
      description: "Sign in easily with your Google account using OAuth 2.0",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Management",
      description: "Complete profile management with secure password changing",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-20 animate-fade-in">
        <div className="mb-8">
          <Shield className="w-20 h-20 mx-auto text-white mb-6 animate-bounce-gentle" />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 gradient-text">
            SecureAuth
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Experience enterprise-grade authentication with beautiful design.
            Protect your applications with multi-factor authentication, OAuth
            integration, and advanced security features.
          </p>
        </div>

        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="glass-effect text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="mb-16">
            <Link
              to="/dashboard"
              className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          <div className="text-center animate-slide-up">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-blue-200">Uptime</div>
          </div>
          <div
            className="text-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-4xl font-bold text-white mb-2">256-bit</div>
            <div className="text-blue-200">Encryption</div>
          </div>
          <div
            className="text-center animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-blue-200">Security Monitoring</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/10 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose SecureAuth?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Built with modern security practices and designed for developers
              who care about user experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-effect p-6 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-blue-200 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Enterprise Security Features
              </h2>
              <p className="text-xl text-blue-100">
                Everything you need to secure your application and protect your
                users
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  "Time-based One-Time Passwords (TOTP)",
                  "Backup Recovery Codes",
                  "Rate Limiting & DDoS Protection",
                  "Account Lockout Protection",
                  "Secure Session Management",
                  "Password Strength Validation",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-white font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[
                  "Google OAuth 2.0 Integration",
                  "MongoDB with Secure Storage",
                  "Express.js Security Middleware",
                  "Real-time Auth Status Checking",
                  "Responsive Modern UI",
                  "Developer-Friendly Documentation",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 animate-slide-up"
                    style={{ animationDelay: `${(index + 6) * 0.1}s` }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-white font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-20 bg-white/10 backdrop-blur-md">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust SecureAuth for their
              authentication needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="glass-effect text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
