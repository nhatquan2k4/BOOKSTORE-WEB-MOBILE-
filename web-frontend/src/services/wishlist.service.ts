import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { BookDto } from '@/types/dtos';

// Route chuẩn theo Controller: [Route("api/[controller]")] -> api/wishlist
const BASE_URL = '/api/wishlist'; 

export const wishlistService = {
  /**
   * Lấy danh sách wishlist của user hiện tại
   * URL: GET /api/wishlist
   */
  async getMyWishlist() {
    try {
      // Backend trả về list BookDto trực tiếp (List<WishlistDto>)
      const response = await axiosInstance.get<any>(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đếm số lượng
   * URL: GET /api/wishlist/count
   */
  async getWishlistCount(): Promise<number> {
    try {
      const response = await axiosInstance.get<{ count: number }>(`${BASE_URL}/count`);
      // API trả về { Count: 5 } hoặc { count: 5 }
      return response.data.count || (response.data as any).Count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Kiểm tra sách có trong wishlist không
   * URL: GET /api/wishlist/{bookId}/exists
   */
  async isInWishlist(bookId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get<{ exists: boolean }>(
        `${BASE_URL}/${bookId}/exists`
      );
      // API trả về { Exists: true } hoặc { exists: true }
      return response.data.exists || (response.data as any).Exists || false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Thêm sách vào wishlist
   * URL: POST /api/wishlist/{bookId}
   * (Lưu ý: Không gửi body, bookId nằm trên URL)
   */
  async addToWishlist(bookId: string) {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa sách khỏi wishlist
   * URL: DELETE /api/wishlist/{bookId}
   */
  async removeFromWishlist(bookId: string) {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa toàn bộ wishlist
   * URL: DELETE /api/wishlist/clear
   */
  async clearWishlist() {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/clear`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Toggle (Thêm nếu chưa có, Xóa nếu có) - Logic Frontend tiện ích
   */
  async toggleWishlist(bookId: string): Promise<boolean> {
    try {
      // 1. Kiểm tra xem đã có chưa
      const exists = await this.isInWishlist(bookId);

      if (exists) {
        // 2. Nếu có rồi -> Xóa
        await this.removeFromWishlist(bookId);
        return false; // Trả về false (đã xóa/không còn like)
      } else {
        // 3. Nếu chưa có -> Thêm
        await this.addToWishlist(bookId);
        return true; // Trả về true (đã thêm/đã like)
      }
    } catch (error) {
      // Fallback: Nếu lỗi check, thử Add luôn
      try {
          await this.addToWishlist(bookId);
          return true;
      } catch {
          throw error;
      }
    }
  }
};