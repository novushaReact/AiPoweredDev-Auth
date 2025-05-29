import React from "react";

const LoadingSpinner = ({ size = "medium", color = "white" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    blue: "border-blue-500 border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-2 
          rounded-full 
          animate-spin
        `}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
