import axiosInstance, { handleApiError } from '@/lib/axios';

export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  bookTitle?: string;
  bookISBN?: string;
  bookImageUrl?: string;
  bookPrice?: number;
  bookDiscountPrice?: number;
  authorNames?: string;
  publisherName?: string;
}

export interface WishlistSummary {
  totalItems: number;
  bookIds: string[];
}

class WishlistService {
  private baseUrl = '/wishlist';

  /**
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Lấy danh sách wishlist của user hiện tại
   */
  async getWishlist(): Promise<WishlistItem[]> {
    if (!this.isAuthenticated()) {
      return [];
    }

    try {
      const response = await axiosInstance.get<WishlistItem[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  /**
   * Thêm sách vào wishlist
   */
  async addToWishlist(bookId: string, userId?: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      // Redirect to login or show login modal
      if (typeof window !== 'undefined') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
      return false;
    }

    try {
      await axiosInstance.post(`${this.baseUrl}/${bookId}`);
      
      // Dispatch event để các component khác biết
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Xóa sách khỏi wishlist
   */
  async removeFromWishlist(bookId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await axiosInstance.delete(`${this.baseUrl}/${bookId}`);
      
      // Dispatch event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
      
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  /**
   * Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
   */
  async toggleWishlist(bookId: string, userId?: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
      return false;
    }

    try {
      const isInWishlist = await this.isInWishlist(bookId);
      
      if (isInWishlist) {
        await this.removeFromWishlist(bookId);
        return false; // Đã xóa
      } else {
        await this.addToWishlist(bookId, userId);
        return true; // Đã thêm
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra sách có trong wishlist không
   */
  async isInWishlist(bookId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await axiosInstance.get<{ exists: boolean } | { Exists: boolean }>(`${this.baseUrl}/${bookId}/exists`);
      // Backend returns uppercase 'Exists', but accept both formats
      return (response.data as any).exists || (response.data as any).Exists || false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  /**
   * Lấy số lượng sách trong wishlist
   */
  async getWishlistCount(): Promise<number> {
    if (!this.isAuthenticated()) {
      return 0;
    }

    try {
      const response = await axiosInstance.get<{ count: number } | { Count: number }>(`${this.baseUrl}/count`);
      // Backend returns uppercase 'Count', but accept both formats
      return (response.data as any).count || (response.data as any).Count || 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }

  /**
   * Xóa toàn bộ wishlist
   */
  async clearWishlist(): Promise<void> {
    if (!this.isAuthenticated()) {
      return;
    }

    try {
      await axiosInstance.delete(`${this.baseUrl}/clear`);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bookId trong wishlist
   */
  async getWishlistBookIds(): Promise<string[]> {
    if (!this.isAuthenticated()) {
      return [];
    }

    try {
      const response = await axiosInstance.get<WishlistSummary>(`${this.baseUrl}/summary`);
      return response.data.bookIds;
    } catch (error) {
      console.error('Error getting wishlist book IDs:', error);
      return [];
    }
  }
}

export const wishlistService = new WishlistService();

