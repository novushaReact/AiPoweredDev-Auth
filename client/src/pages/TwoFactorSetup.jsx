import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  Smartphone,
  Key,
  Copy,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const TwoFactorSetup = () => {
  const { user, setupTwoFactor, verifyTwoFactorSetup, error, setError } =
    useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Check if user already has 2FA enabled, redirect to dashboard if so
  useEffect(() => {
    if (user?.twoFactorEnabled) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Initialize 2FA setup when component loads
  const initializeTwoFactor = useCallback(async () => {
    setIsLoading(true);
    const result = await setupTwoFactor();
    setIsLoading(false);

    if (result.success) {
      setQrCode(result.qrCode);
      setSecret(result.manualEntryKey);
      // Backup codes are only provided after verification
    }
  }, [setupTwoFactor]);

  // Call initializeTwoFactor when step 1 is reached
  useEffect(() => {
    if (step === 1) {
      initializeTwoFactor();
    }
  }, [step, initializeTwoFactor]);
  const handleVerification = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    const result = await verifyTwoFactorSetup(verificationCode);
    setIsLoading(false);

    if (result.success) {
      setBackupCodes(result.backupCodes);
      setStep(3);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "secret") {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else if (type === "backup") {
        setCopiedBackupCodes(true);
        setTimeout(() => setCopiedBackupCodes(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "secureauth-backup-codes.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">
          Install Authenticator App
        </h2>
        <p className="text-blue-200 max-w-2xl mx-auto">
          To set up two-factor authentication, you'll need an authenticator app
          on your mobile device. We recommend one of these popular options:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: "Google Authenticator",
            description: "Free app by Google",
            platforms: ["iOS", "Android"],
            color: "bg-blue-500",
          },
          {
            name: "Microsoft Authenticator",
            description: "Free app by Microsoft",
            platforms: ["iOS", "Android"],
            color: "bg-green-500",
          },
          {
            name: "Authy",
            description: "Free app by Twilio",
            platforms: ["iOS", "Android", "Desktop"],
            color: "bg-purple-500",
          },
        ].map((app, index) => (
          <div key={index} className="glass-effect p-6 rounded-xl text-center">
            <div
              className={`w-12 h-12 ${app.color} rounded-lg mx-auto mb-4 flex items-center justify-center`}
            >
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {app.name}
            </h3>
            <p className="text-blue-200 text-sm mb-3">{app.description}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {app.platforms.map((platform, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white/20 text-white px-2 py-1 rounded"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-100 text-sm">
            <p className="font-medium mb-1">Important:</p>
            <p>
              Download and install one of these apps before proceeding to the
              next step.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setStep(2)}
          className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <span>I've Installed an App</span>
          <Key className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Scan QR Code</h2>
        <p className="text-blue-200">
          Open your authenticator app and scan the QR code below, or manually
          enter the secret key.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="glass-effect p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Scan QR Code
            </h3>
            {qrCode ? (
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-white/10 rounded-lg mx-auto flex items-center justify-center">
                <LoadingSpinner size="large" />
              </div>
            )}
            <p className="text-blue-200 text-sm mt-4">
              Use your authenticator app to scan this QR code
            </p>
          </div>

          {/* Manual Entry */}
          <div className="glass-effect p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Manual Entry
            </h3>
            <p className="text-blue-200 text-sm mb-4">
              If you can't scan the QR code, manually enter this secret key in
              your authenticator app:
            </p>

            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <code className="text-white font-mono text-sm break-all flex-1">
                  {showSecret ? secret : "••••••••••••••••••••••••••••••••"}
                </code>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-blue-300 hover:text-white transition-colors"
                    title={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(secret, "secret")}
                    className="text-blue-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedSecret ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {copiedSecret && (
              <p className="text-green-400 text-sm mt-2">
                Secret copied to clipboard!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Verification Form */}
      <div className="glass-effect p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Verify Setup</h3>
        <p className="text-blue-200 text-sm mb-4">
          After adding the account to your authenticator app, enter the 6-digit
          code to verify the setup:
        </p>

        <form onSubmit={handleVerification} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-white mb-2"
            >
              6-Digit Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              className="
                w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl
                placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono tracking-widest
              "
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 text-blue-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="
                flex-1 flex items-center justify-center space-x-2 bg-white text-purple-600 hover:bg-blue-50 
                px-6 py-3 rounded-lg font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="blue" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Verify & Enable 2FA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6 animate-bounce-gentle" />
        <h2 className="text-3xl font-bold text-white mb-4">
          2FA Successfully Enabled!
        </h2>
        <p className="text-blue-200 text-lg mb-8">
          Your account is now protected with two-factor authentication.
        </p>
      </div>

      {/* Backup Codes */}
      <div className="glass-effect p-6 rounded-xl text-left">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Key className="w-5 h-5" />
          <span>Backup Recovery Codes</span>
        </h3>

        <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-yellow-100 text-sm">
              <p className="font-medium mb-1">Important:</p>
              <p>
                Save these backup codes in a secure location. You can use them
                to access your account if you lose your authenticator device.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className="bg-white/10 border border-white/20 rounded-lg p-3 text-center"
            >
              <code className="text-white font-mono">{code}</code>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => copyToClipboard(backupCodes.join("\n"), "backup")}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {copiedBackupCodes ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Codes</span>
              </>
            )}
          </button>

          <button
            onClick={downloadBackupCodes}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Codes</span>
          </button>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">
          Two-Factor Authentication Setup
        </h1>
        <p className="text-blue-200 text-lg">
          Secure your account with an additional layer of protection
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors
                ${
                  step >= stepNumber
                    ? "bg-white text-purple-600"
                    : "bg-white/20 text-blue-300"
                }
              `}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`
                  w-16 h-1 transition-colors
                  ${step > stepNumber ? "bg-white" : "bg-white/20"}
                `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-8">
          <span className="text-blue-200 text-sm">Install App</span>
          <span className="text-blue-200 text-sm">Setup & Verify</span>
          <span className="text-blue-200 text-sm">Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-fade-in">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
