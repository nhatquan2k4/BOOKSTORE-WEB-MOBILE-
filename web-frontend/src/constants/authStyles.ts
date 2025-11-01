/**
 * Auth-specific style constants
 * Reusable styles for authentication pages
 */

import { cn } from "@/lib/utils/cn";

/**
 * Input field styles
 */
export const authInputStyles = {
  base: "w-full px-4 py-2.5 border rounded-lg transition-all",
  focus:
    "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
  disabled: "disabled:bg-gray-100 disabled:cursor-not-allowed",
  error: "border-red-400",
  normal: "border-gray-300",
} as const;

/**
 * Button styles
 */
export const authButtonStyles = {
  primary:
    "w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
  outline:
    "w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  ghost: "w-full border-2 border-gray-300",
} as const;

/**
 * Link styles
 */
export const authLinkStyles = {
  primary: "text-blue-600 hover:text-blue-700 font-medium transition-colors",
  semibold: "text-blue-600 hover:text-blue-700 font-semibold transition-colors",
  subtle: "text-sm text-gray-600 hover:text-gray-900 transition-colors",
} as const;

/**
 * Checkbox/Radio styles
 */
export const authCheckboxStyles = {
  base: "w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600",
} as const;

/**
 * Text styles
 */
export const authTextStyles = {
  title: "text-3xl font-bold text-gray-900 mb-2",
  subtitle: "text-gray-600",
  label: "block text-sm font-medium text-gray-700",
  helper: "text-sm text-gray-500",
  error: "text-sm text-red-600",
} as const;

/**
 * Container styles
 */
export const authContainerStyles = {
  card: "bg-white rounded-2xl shadow-xl p-8 w-full max-w-md",
  header: "text-center mb-8",
  form: "space-y-5",
  divider: "relative my-8",
} as const;

/**
 * Icon styles
 */
export const authIconStyles = {
  gradient:
    "w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto",
  small: "w-4 h-4",
  medium: "w-5 h-5",
  large: "w-8 h-8",
} as const;

/**
 * Helper functions to generate combined class names
 */
export const getInputClassName = (hasError?: boolean): string => {
  return cn(
    authInputStyles.base,
    authInputStyles.focus,
    authInputStyles.disabled,
    hasError ? authInputStyles.error : authInputStyles.normal
  );
};

export const getButtonClassName = (
  variant: keyof typeof authButtonStyles = "primary"
): string => {
  return authButtonStyles[variant];
};

export const getLinkClassName = (
  variant: keyof typeof authLinkStyles = "primary"
): string => {
  return authLinkStyles[variant];
};

/**
 * Password strength indicator colors
 */
export const passwordStrengthColors = {
  weak: "bg-red-500",
  medium: "bg-yellow-500",
  strong: "bg-green-500",
  empty: "bg-gray-200",
} as const;

/**
 * Alert/Message box styles
 */
export const authAlertStyles = {
  success: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg",
  error: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",
  info: "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg",
  warning: "mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg",
} as const;

/**
 * Common auth page layout values
 */
export const authLayoutStyles = {
  background:
    "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4",
  innerContainer: "w-full max-w-md",
} as const;
