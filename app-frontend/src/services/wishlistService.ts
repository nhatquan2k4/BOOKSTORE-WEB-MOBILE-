// Wishlist Service - API calls for wishlist management
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  WishlistItem,
  WishlistSummary,
  WishlistCountResponse,
  BookInWishlistResponse,
  AddToWishlistResponse,
} from '../types/wishlist';

/**
 * Get user's wishlist
 */
export const getMyWishlist = async (): Promise<WishlistItem[]> => {
  try {
    console.log('💖 Fetching wishlist from API...');
    const response = await api.get<WishlistItem[]>(API_ENDPOINTS.WISHLIST.GET);
    console.log('💖 Wishlist items:', response.length);
    return response;
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Get wishlist count
 */
export const getWishlistCount = async (): Promise<number> => {
  try {
    const response = await api.get<WishlistCountResponse>(API_ENDPOINTS.WISHLIST.COUNT);
    return response.count;
  } catch (error: any) {
    console.error('Error getting wishlist count:', error);
    throw error;
  }
};

/**
 * Get wishlist summary (list of book IDs)
 */
export const getWishlistSummary = async (): Promise<WishlistSummary> => {
  try {
    const response = await api.get<WishlistSummary>(API_ENDPOINTS.WISHLIST.SUMMARY);
    return response;
  } catch (error: any) {
    console.error('Error getting wishlist summary:', error);
    throw error;
  }
};

/**
 * Check if book is in wishlist
 */
export const isBookInWishlist = async (bookId: string): Promise<boolean> => {
  try {
    const response = await api.get<BookInWishlistResponse>(`${API_ENDPOINTS.WISHLIST.CHECK_EXISTS}/${bookId}/exists`);
    return response.exists;
  } catch (error: any) {
    console.error('Error checking book in wishlist:', error);
    return false;
  }
};

/**
 * Add book to wishlist
 */
export const addToWishlist = async (bookId: string): Promise<WishlistItem> => {
  try {
    console.log('💖 Adding to wishlist:', bookId);
    const response = await api.post<AddToWishlistResponse>(
      `${API_ENDPOINTS.WISHLIST.ADD}/${bookId}`
    );
    console.log('✅ Added to wishlist:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove book from wishlist
 */
export const removeFromWishlist = async (bookId: string): Promise<void> => {
  try {
    console.log('💔 Removing from wishlist:', bookId);
    await api.delete(`${API_ENDPOINTS.WISHLIST.REMOVE}/${bookId}`);
    console.log('✅ Removed from wishlist');
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (): Promise<void> => {
  try {
    console.log('🗑️ Clearing wishlist...');
    await api.delete(API_ENDPOINTS.WISHLIST.CLEAR);
    console.log('✅ Wishlist cleared');
  } catch (error: any) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

/**
 * Toggle wishlist (add if not exists, remove if exists)
 */
export const toggleWishlist = async (bookId: string): Promise<boolean> => {
  try {
    const exists = await isBookInWishlist(bookId);
    if (exists) {
      await removeFromWishlist(bookId);
      return false; // Removed
    } else {
      await addToWishlist(bookId);
      return true; // Added
    }
  } catch (error: any) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

export default {
  getMyWishlist,
  getWishlistCount,
  getWishlistSummary,
  isBookInWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  toggleWishlist,
};
