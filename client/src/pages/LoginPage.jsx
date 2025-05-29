import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { login, user, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    // Clear errors when form data changes
    if (error) {
      setError(null);
    }
  }, [formData, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (showTwoFactor && !formData.twoFactorCode) {
      errors.twoFactorCode = "2FA code is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await login(
      formData.email,
      formData.password,
      showTwoFactor ? formData.twoFactorCode : null
    );

    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.requiresTwoFactor) {
      setShowTwoFactor(true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-fade-in">
          <Shield className="mx-auto h-16 w-16 text-white animate-bounce-gentle" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-white hover:text-blue-200 transition-colors underline"
            >
              Sign up here
            </Link>
          </p>
        </div>

        <div className="glass-effect rounded-xl p-8 animate-slide-up">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg flex items-center space-x-2 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`
                    appearance-none relative block w-full pl-12 pr-3 py-3 
                    bg-white/10 border ${
                      formErrors.email ? "border-red-400" : "border-white/20"
                    } 
                    placeholder-blue-300 text-white rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-all focus-ring
                  `}
                  placeholder="Enter your email"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`
                    appearance-none relative block w-full pl-12 pr-12 py-3 
                    bg-white/10 border ${
                      formErrors.password ? "border-red-400" : "border-white/20"
                    } 
                    placeholder-blue-300 text-white rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-all focus-ring
                  `}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Two Factor Code Field */}
            {showTwoFactor && (
              <div className="animate-slide-up">
                <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-medium text-white mb-2"
                >
                  2FA Authentication Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    required
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                    className={`
                      appearance-none relative block w-full pl-12 pr-3 py-3 
                      bg-white/10 border ${
                        formErrors.twoFactorCode
                          ? "border-red-400"
                          : "border-white/20"
                      } 
                      placeholder-blue-300 text-white rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                      transition-all focus-ring
                    `}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
                {formErrors.twoFactorCode && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.twoFactorCode}
                  </p>
                )}
                <p className="mt-2 text-sm text-blue-200">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="
                  group relative w-full flex justify-center py-3 px-4 
                  border border-transparent text-sm font-medium rounded-lg 
                  text-purple-600 bg-white hover:bg-blue-50 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all transform hover:scale-105
                "
              >
                {isLoading ? (
                  <LoadingSpinner size="small" color="blue" />
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>
                      {showTwoFactor ? "Verify & Sign In" : "Sign In"}
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            {!showTwoFactor && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-blue-200">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="
                      w-full flex justify-center items-center py-3 px-4 
                      border border-white/20 rounded-lg text-white 
                      hover:bg-white/10 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-blue-400
                      transition-all transform hover:scale-105
                    "
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
