/**
 * Complete Theme Configuration for MFA Authentication App
 * Professional, tech-oriented design system with excellent UX principles
 */

export const theme = {
  // =============================================================================
  // BRAND COLORS
  // =============================================================================
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },

    accent: {
      purple: '#8b5cf6',
      green: '#10b981',
      orange: '#f59e0b',
      pink: '#ec4899',
      red: '#ef4444',
    },

    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },

    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // =============================================================================
  // GRADIENTS
  // =============================================================================
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    dark: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cyberpunk: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
    neon: 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)',
  },

  // =============================================================================
  // TYPOGRAPHY
  // =============================================================================
  fonts: {
    primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // =============================================================================
  // SPACING SYSTEM
  // =============================================================================
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '5rem',   // 80px
    '5xl': '6rem',   // 96px
  },

  // =============================================================================
  // BORDER RADIUS
  // =============================================================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '50%',
  },

  // =============================================================================
  // SHADOWS
  // =============================================================================
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    glowLarge: '0 0 40px rgba(59, 130, 246, 0.4)',
  },

  // =============================================================================
  // ANIMATION SYSTEM
  // =============================================================================
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
      slowest: '1200ms',
    },

    easing: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // =============================================================================
  // GLASS MORPHISM
  // =============================================================================
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      blur: '10px',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.3)',
      blur: '15px',
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'rgba(255, 255, 255, 0.4)',
      blur: '20px',
    },
  },

  // =============================================================================
  // BREAKPOINTS
  // =============================================================================
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // =============================================================================
  // Z-INDEX STACK
  // =============================================================================
  zIndex: {
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
    max: 9999,
  },

  // =============================================================================
  // COMPONENT SPECIFIC STYLES
  // =============================================================================
  components: {
    button: {
      heights: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
        xl: '3.5rem',    // 56px
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
        xl: '1.25rem 2.5rem',
      },
    },

    input: {
      heights: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
      },
    },

    card: {
      padding: {
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px
        lg: '2rem',      // 32px
        xl: '2.5rem',    // 40px
      },
    },
  },
};

// =============================================================================
// THEME VARIANTS
// =============================================================================

export const themeVariants = {
  // Professional Blue Theme (Default)
  professional: {
    primary: theme.gradients.primary,
    accent: theme.colors.accent.purple,
    surface: theme.glass.medium,
  },

  // Cyberpunk Theme
  cyberpunk: {
    primary: theme.gradients.cyberpunk,
    accent: theme.colors.accent.pink,
    surface: theme.glass.heavy,
  },

  // Nature/Green Theme
  nature: {
    primary: theme.gradients.success,
    accent: theme.colors.accent.green,
    surface: theme.glass.light,
  },

  // Sunset/Warm Theme
  sunset: {
    primary: theme.gradients.warm,
    accent: theme.colors.accent.orange,
    surface: theme.glass.medium,
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getColor = (colorPath) => {
  const path = colorPath.split('.');
  let result = theme.colors;
  
  for (const key of path) {
    result = result[key];
    if (!result) return null;
  }
  
  return result;
};

export const getSpacing = (size) => theme.spacing[size] || size;

export const getFontSize = (size) => theme.fontSizes[size] || size;

export const getShadow = (size) => theme.shadows[size] || size;

export const getGradient = (name) => theme.gradients[name] || name;

// =============================================================================
// CSS-IN-JS HELPERS
// =============================================================================

export const createGlassEffect = (variant = 'medium') => ({
  background: theme.glass[variant].background,
  backdropFilter: `blur(${theme.glass[variant].blur})`,
  WebkitBackdropFilter: `blur(${theme.glass[variant].blur})`,
  border: `1px solid ${theme.glass[variant].border}`,
});

export const createGradientText = (gradient = 'primary') => ({
  background: theme.gradients[gradient],
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

export const createHoverEffect = (translateY = '-2px') => ({
  transition: `all ${theme.animations.durations.normal} ${theme.animations.easing.inOut}`,
  '&:hover': {
    transform: `translateY(${translateY})`,
  },
});

export default theme;
