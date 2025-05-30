/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // =============================================================================
      // BRAND COLORS
      // =============================================================================
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          purple: "#8b5cf6",
          green: "#10b981",
          orange: "#f59e0b",
          pink: "#ec4899",
          red: "#ef4444",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.15)",
          heavy: "rgba(255, 255, 255, 0.2)",
        },
      },

      // =============================================================================
      // GRADIENTS
      // =============================================================================
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-accent": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "gradient-dark": "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        "gradient-success": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        "gradient-warm": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "gradient-cyberpunk":
          "linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)",
        "gradient-neon": "linear-gradient(135deg, #00ff87 0%, #60efff 100%)",
      },

      // =============================================================================
      // TYPOGRAPHY
      // =============================================================================
      fontFamily: {
        primary: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        secondary: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "Fira Code",
          "Monaco",
          "Cascadia Code",
          "ui-monospace",
          "monospace",
        ],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      // =============================================================================
      // SPACING & SIZING
      // =============================================================================
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },

      // =============================================================================
      // SHADOWS WITH GLOW EFFECTS
      // =============================================================================
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.4)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.3)",
      },

      // =============================================================================
      // BORDER RADIUS
      // =============================================================================
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem",
      },

      // =============================================================================
      // BACKDROP FILTERS
      // =============================================================================
      backdropBlur: {
        xs: "2px",
        "4xl": "72px",
      },

      // =============================================================================
      // ANIMATIONS
      // =============================================================================
      animation: {
        "fade-in": "fadeIn 0.8s ease-in-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-down": "slideDown 0.6s ease-out forwards",
        "slide-left": "slideLeft 0.6s ease-out forwards",
        "slide-right": "slideRight 0.6s ease-out forwards",
        "bounce-gentle": "bounceGentle 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scale: "scale 0.3s ease-out forwards",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        float: "float 3s ease-in-out infinite",
        swing: "swing 1s ease-in-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceGentle: {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-10px)" },
          "60%": { transform: "translateY(-5px)" },
        },
        scale: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        swing: {
          "20%": { transform: "rotate3d(0, 0, 1, 15deg)" },
          "40%": { transform: "rotate3d(0, 0, 1, -10deg)" },
          "60%": { transform: "rotate3d(0, 0, 1, 5deg)" },
          "80%": { transform: "rotate3d(0, 0, 1, -5deg)" },
          "100%": { transform: "rotate3d(0, 0, 1, 0deg)" },
        },
      },

      // =============================================================================
      // TRANSITION TIMING
      // =============================================================================
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: {
        400: "400ms",
        600: "600ms",
        800: "800ms",
        1200: "1200ms",
      },

      // =============================================================================
      // Z-INDEX
      // =============================================================================
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
        toast: "1080",
      },
    },
  },
  plugins: [
    // Custom plugin for additional utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Glass morphism utilities
        ".glass-light": {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        ".glass-medium": {
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        ".glass-heavy": {
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
        },

        // Gradient text utilities
        ".text-gradient-primary": {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        },
        ".text-gradient-secondary": {
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        },
        ".text-gradient-accent": {
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        },

        // Interactive states
        ".interactive": {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-2px)",
          },
        },

        // Focus ring
        ".focus-ring": {
          "&:focus": {
            outline: "2px solid #3b82f6",
            outlineOffset: "2px",
            borderRadius: theme("borderRadius.md"),
          },
        },

        // Loading shimmer
        ".loading-shimmer": {
          background:
            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200px 100%",
          animation: "shimmer 1.5s infinite",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
