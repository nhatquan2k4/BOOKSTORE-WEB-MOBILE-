/**
 * Theme constants for the application
 * Centralized color palette and design tokens
 */

export const colors = {
  // Primary colors (Blue - matching header)
  primary: {
    50: "blue-50",
    100: "blue-100",
    200: "blue-200",
    300: "blue-300",
    400: "blue-400",
    500: "blue-500",
    600: "blue-600",
    700: "blue-700",
    800: "blue-800",
    900: "blue-900",
  },

  // Semantic colors
  error: {
    light: "red-50",
    border: "red-200",
    text: "red-600",
    dark: "red-700",
  },

  success: {
    light: "green-50",
    border: "green-200",
    text: "green-600",
    dark: "green-700",
  },

  warning: {
    light: "yellow-50",
    border: "yellow-200",
    text: "yellow-600",
    dark: "yellow-700",
  },

  info: {
    light: "blue-50",
    border: "blue-200",
    text: "blue-600",
    dark: "blue-700",
  },

  // Neutral colors
  gray: {
    50: "gray-50",
    100: "gray-100",
    200: "gray-200",
    300: "gray-300",
    400: "gray-400",
    500: "gray-500",
    600: "gray-600",
    700: "gray-700",
    800: "gray-800",
    900: "gray-900",
  },
} as const;

/**
 * Gradient definitions
 */
export const gradients = {
  primary: "from-blue-600 to-blue-700",
  primaryHover: "from-blue-700 to-blue-800",
  icon: "from-blue-600 to-blue-800",
} as const;

/**
 * Common spacing values
 */
export const spacing = {
  xs: "0.25rem", // 1
  sm: "0.5rem", // 2
  md: "1rem", // 4
  lg: "1.5rem", // 6
  xl: "2rem", // 8
  "2xl": "3rem", // 12
} as const;

/**
 * Border radius values
 */
export const borderRadius = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const;

/**
 * Common transition values
 */
export const transitions = {
  base: "transition-all",
  colors: "transition-colors",
  fast: "transition-all duration-150",
  normal: "transition-all duration-300",
  slow: "transition-all duration-500",
} as const;
