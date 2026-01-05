/**
 * UUID/GUID Utilities
 * Generate and validate UUIDs
 */

/**
 * Generate a UUID v4 (random)
 * Compatible with C# Guid format
 */
export const generateUUID = (): string => {
  // Use crypto API if available (modern browsers/React Native)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: Manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Validate UUID/GUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Format UUID to lowercase
 */
export const normalizeUUID = (uuid: string): string => {
  return uuid.toLowerCase();
};

/**
 * Generate a short UUID (for display)
 */
export const shortUUID = (uuid: string): string => {
  return uuid.split('-')[0];
};

export default {
  generateUUID,
  isValidUUID,
  normalizeUUID,
  shortUUID,
};
