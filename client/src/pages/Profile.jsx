import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  AlertCircle,
  CheckCircle,
  Trash2,
  Globe,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const Profile = () => {
  const {
    user,
    updateProfile,
    changePassword,
    disableTwoFactor,
    error,
    setError,
  } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [show2FAPassword, setShow2FAPassword] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  React.useEffect(() => {
    if (passwordData.newPassword) {
      checkPasswordStrength(passwordData.newPassword);
    }
  }, [passwordData.newPassword]);

  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Include lowercase letters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Include uppercase letters");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Include numbers");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push("Include special characters");

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    if (passwordStrength.score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));

    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (successMessage) setSuccessMessage("");
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (successMessage) setSuccessMessage("");
    if (error) setError(null);
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!profileData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "Email is invalid";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordStrength.score < 3) {
      errors.newPassword = "Password is too weak";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    setIsUpdatingProfile(true);

    const result = await updateProfile({
      firstName: profileData.firstName.trim(),
      lastName: profileData.lastName.trim(),
      email: profileData.email.toLowerCase(),
    });

    setIsUpdatingProfile(false);

    if (result.success) {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    setIsChangingPassword(false);

    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();

    if (!disable2FAPassword) {
      setError("Password is required to disable 2FA");
      return;
    }

    setIsDisabling2FA(true);

    const result = await disableTwoFactor(disable2FAPassword);

    setIsDisabling2FA(false);

    if (result.success) {
      setDisable2FAPassword("");
      setSuccessMessage("Two-factor authentication disabled successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-blue-200 text-lg">
          Manage your account information and security settings
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-500/20 border border-green-500/50 text-white p-4 rounded-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg flex items-center space-x-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="glass-effect p-6 rounded-xl animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>Basic Information</span>
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className={`
                      w-full px-4 py-3 bg-white/10 border rounded-lg text-white
                      placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                      ${
                        profileErrors.firstName
                          ? "border-red-400"
                          : "border-white/20"
                      }
                    `}
                    placeholder="Enter your first name"
                  />
                  {profileErrors.firstName && (
                    <p className="mt-1 text-sm text-red-400">
                      {profileErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className={`
                      w-full px-4 py-3 bg-white/10 border rounded-lg text-white
                      placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                      ${
                        profileErrors.lastName
                          ? "border-red-400"
                          : "border-white/20"
                      }
                    `}
                    placeholder="Enter your last name"
                  />
                  {profileErrors.lastName && (
                    <p className="mt-1 text-sm text-red-400">
                      {profileErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

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
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={`
                      w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white
                      placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                      ${
                        profileErrors.email
                          ? "border-red-400"
                          : "border-white/20"
                      }
                    `}
                    placeholder="Enter your email"
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {profileErrors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="
                  flex items-center space-x-2 bg-white text-purple-600 hover:bg-blue-50 
                  px-6 py-3 rounded-lg font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isUpdatingProfile ? (
                  <LoadingSpinner size="small" color="blue" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Change Password - Only for local accounts */}
          {user.provider === "local" && (
            <div
              className="glass-effect p-6 rounded-xl animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Lock className="w-6 h-6" />
                <span>Change Password</span>
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`
                        w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white
                        placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                        ${
                          passwordErrors.currentPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }
                      `}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`
                        w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white
                        placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                        ${
                          passwordErrors.newPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }
                      `}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium">
                          {passwordStrength.score <= 2
                            ? "Weak"
                            : passwordStrength.score <= 3
                            ? "Fair"
                            : passwordStrength.score <= 4
                            ? "Good"
                            : "Strong"}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-blue-200">
                          {passwordStrength.feedback.map((item, index) => (
                            <div key={index}>• {item}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`
                        w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white
                        placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                        ${
                          passwordErrors.confirmPassword
                            ? "border-red-400"
                            : "border-white/20"
                        }
                      `}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {passwordData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {passwordData.newPassword ===
                      passwordData.confirmPassword ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">
                            Passwords do not match
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="
                    flex items-center space-x-2 bg-white text-purple-600 hover:bg-blue-50 
                    px-6 py-3 rounded-lg font-medium transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isChangingPassword ? (
                    <LoadingSpinner size="small" color="blue" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Security Sidebar */}
        <div className="space-y-6">
          {/* Account Security */}
          <div
            className="glass-effect p-6 rounded-xl animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Account Security</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-200">Account Type</span>
                <div className="flex items-center space-x-2">
                  {user.provider === "google" ? (
                    <>
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">Google</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">Local</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-200">Password Protection</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-200">Two-Factor Auth</span>
                {user.twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          {user.twoFactorEnabled ? (
            <div
              className="glass-effect p-6 rounded-xl animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Two-Factor Auth</span>
              </h3>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Enabled</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Your account is protected with two-factor authentication.
                </p>
              </div>

              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label
                    htmlFor="disable2FAPassword"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Enter Password to Disable
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      id="disable2FAPassword"
                      type={show2FAPassword ? "text" : "password"}
                      value={disable2FAPassword}
                      onChange={(e) => setDisable2FAPassword(e.target.value)}
                      className="
                        w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                        placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400
                      "
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow2FAPassword(!show2FAPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    >
                      {show2FAPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDisabling2FA}
                  className="
                    w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 
                    text-white px-4 py-2 rounded-lg font-medium transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isDisabling2FA ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Disable 2FA</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div
              className="glass-effect p-6 rounded-xl animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Two-Factor Auth</span>
              </h3>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Not Enabled</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Enhance your account security by enabling two-factor
                  authentication.
                </p>
              </div>

              <a
                href="/2fa-setup"
                className="
                  w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 
                  text-white px-4 py-2 rounded-lg font-medium transition-colors
                "
              >
                <Shield className="w-4 h-4" />
                <span>Enable 2FA</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
