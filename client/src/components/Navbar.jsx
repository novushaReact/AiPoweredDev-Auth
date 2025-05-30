import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, User, LogOut, Menu, X, Settings } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-white font-bold text-xl hover:text-blue-200 transition-colors"
          >
            <Shield className="w-8 h-8" />
            <span className="hidden sm:block">SecureAuth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-blue-200 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:text-blue-200 transition-colors font-medium"
                >
                  Profile
                </Link>
                {!(user.twoFactorEnabled || user.twoFactorAuth?.isEnabled) && (
                  <Link
                    to="/2fa-setup"
                    className="text-yellow-300 hover:text-yellow-200 transition-colors font-medium flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Setup 2FA</span>
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  {" "}
                  <div className="flex items-center space-x-2 text-white">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.firstName}</span>
                    {(user.twoFactorEnabled ||
                      user.twoFactorAuth?.isEnabled) && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        2FA
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-blue-200 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-purple-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-blue-200 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20 animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              {user ? (
                <>
                  {" "}
                  <div className="flex items-center space-x-2 text-white border-b border-white/20 pb-4">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.firstName}</span>
                    {(user.twoFactorEnabled ||
                      user.twoFactorAuth?.isEnabled) && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        2FA
                      </span>
                    )}
                  </div>
                  <Link
                    to="/dashboard"
                    className="block text-white hover:text-blue-200 transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-white hover:text-blue-200 transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {!(
                    user.twoFactorEnabled || user.twoFactorAuth?.isEnabled
                  ) && (
                    <Link
                      to="/2fa-setup"
                      className="block text-yellow-300 hover:text-yellow-200 transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Setup 2FA
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="block text-white hover:text-blue-200 transition-colors font-medium py-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-white text-purple-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
