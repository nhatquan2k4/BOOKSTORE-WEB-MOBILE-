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
   * Lấy danh sách wishlist của user hiện tại
   */
  async getWishlist(): Promise<WishlistItem[]> {
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
    try {
      const response = await axiosInstance.get<{ exists: boolean }>(`${this.baseUrl}/${bookId}/exists`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  /**
   * Lấy số lượng sách trong wishlist
   */
  async getWishlistCount(): Promise<number> {
    try {
      const response = await axiosInstance.get<{ count: number }>(`${this.baseUrl}/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }

  /**
   * Xóa toàn bộ wishlist
   */
  async clearWishlist(): Promise<void> {
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

