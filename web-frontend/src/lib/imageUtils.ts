/**
 * Image URL Utilities
 * Based on app-frontend logic for consistent image handling
 */

import axiosInstance from './axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tautologously-hyperconscious-carolyne.ngrok-free.dev/';
// MinIO is accessible via localhost:9000 (not through API /storage)
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://tautologously-hyperconscious-carolyne.ngrok-free.dev/storage';

/**
 * Normalize image URL with smart resolution
 * Handles relative paths, full URLs, and localhost replacements
 * 
 * Logic from app-frontend/src/services/bookService.ts
 */
export const normalizeImageUrl = (url?: string | null): string | null => {
  // If no URL or empty string, return null (will show placeholder)
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }

  const trimmedUrl = url.trim();

  // If already a full external URL (e.g., salt.tikicdn.com), return as-is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    // If URL points to localhost/127.0.0.1, replace with storage host
    if (trimmedUrl.includes('localhost') || trimmedUrl.includes('127.0.0.1') || trimmedUrl.includes('0.0.0.0')) {
      try {
        const storageUrl = new URL(STORAGE_BASE_URL);
        const storageHost = storageUrl.hostname;
        const storagePort = storageUrl.port || '80';
        
        return trimmedUrl
          .replace(/localhost|127\.0\.0\.1|0\.0\.0\.0/g, storageHost)
          .replace(':9000', `:${storagePort}`)
          .replace(':5276', `:${storagePort}`);
      } catch {
        // If URL parsing fails, return original
        return trimmedUrl;
      }
    }
    
    return trimmedUrl;
  }

  // Handle relative paths (e.g., "/images/books/book1.jpg" or "\images\books\book1.jpg")
  let cleanUrl = trimmedUrl;
  
  // Convert Windows backslashes to forward slashes
  cleanUrl = cleanUrl.replace(/\\/g, '/');
  
  // Ensure it starts with /
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = `/${cleanUrl}`;
  }

  // Prepend STORAGE_BASE_URL (not API_BASE_URL)
  const cleanBase = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL;
  return `${cleanBase}${cleanUrl}`;
};

/**
 * Get book cover image from API
 * Same as app-frontend bookService.getBookCover()
 */
export const getBookCoverUrl = async (bookId: string): Promise<string | null> => {
  try {
    const response = await axiosInstance.get<{ imageUrl: string }>(`/api/books/${bookId}/images/cover`);
    
    if (!response?.data?.imageUrl) {
      return null;
    }

    // Normalize the image URL
    return normalizeImageUrl(response.data.imageUrl);
  } catch (error) {
    console.error(`Error fetching cover for book ${bookId}:`, error);
    return null;
  }
};

/**
 * Get full image URL for display
 * Alias for normalizeImageUrl for backward compatibility
 */
export const getFullImageUrl = normalizeImageUrl;

/**
 * Check if image URL is valid
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  return normalizeImageUrl(url) !== null;
};

/**
 * Get image URL or fallback
 * If url is invalid, returns fallback (or null if no fallback provided)
 */
export const getImageUrlOrFallback = (
  url?: string | null, 
  fallback?: string | null
): string | null => {
  const normalized = normalizeImageUrl(url);
  return normalized || fallback || null;
};
