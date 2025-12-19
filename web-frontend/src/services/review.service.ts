import axiosInstance, { handleApiError } from '@/lib/axios';
import { 
  ReviewDto, 
  ReviewListDto,
  ReviewStatisticsDto, 
  CreateReviewDto,
  UpdateReviewDto,
  PagedResult
} from '@/types/dtos';

export const reviewService = {
  /**
   * Lấy danh sách review của sách
   * URL: GET /api/books/{bookId}/reviews
   */
  async getBookReviews(bookId: string, page = 1, pageSize = 10, sortBy?: string) {
    try {
      const response = await axiosInstance.get<{ success: boolean, data: PagedResult<ReviewListDto> }>(
        `/api/books/${bookId}/reviews`, 
        { params: { page, pageSize, sortBy } }
      );
      // Backend trả về: { success: true, data: { reviews: [], pagination: {} } }
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thống kê review
   * URL: GET /api/books/{bookId}/reviews/statistics
   */
  async getBookReviewStatistics(bookId: string) {
    try {
      const response = await axiosInstance.get<{ success: boolean, data: ReviewStatisticsDto }>(
        `/api/books/${bookId}/reviews/statistics`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo review mới
   * URL: POST /api/books/{bookId}/reviews
   */
  async createReview(bookId: string, data: CreateReviewDto) {
    try {
      const response = await axiosInstance.post<{ success: boolean, data: ReviewDto }>(
        `/api/books/${bookId}/reviews`, 
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy review của chính user hiện tại (để hiển thị nút sửa/xóa)
   * URL: GET /api/books/{bookId}/reviews/my-review
   */
  async getMyReview(bookId: string) {
    try {
      const response = await axiosInstance.get<{ success: boolean, data: ReviewDto }>(
        `/api/books/${bookId}/reviews/my-review`
      );
      return response.data.data;
    } catch (error) {
      // Nếu chưa review (404), trả về null thay vì throw lỗi
      return null;
    }
  },

  /**
   * Cập nhật review của chính user
   * URL: PUT /api/books/{bookId}/reviews/my-review
   */
  async updateMyReview(bookId: string, data: UpdateReviewDto) {
    try {
      const response = await axiosInstance.put<{ success: boolean, data: ReviewDto }>(
        `/api/books/${bookId}/reviews/my-review`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa review của chính user
   * URL: DELETE /api/books/{bookId}/reviews/my-review
   */
  async deleteMyReview(bookId: string) {
    try {
      const response = await axiosInstance.delete(
        `/api/books/${bookId}/reviews/my-review`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};