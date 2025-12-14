import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import {
  ReviewDto,
  ReviewListDto,
  CreateReviewDto,
  UpdateReviewDto,
  QuickRatingDto,
  ReviewStatisticsDto,
} from '@/types/dtos';

const REVIEW_BASE_URL = '/api/reviews';

export interface GetReviewsParams {
  pageNumber?: number;
  pageSize?: number;
  bookId?: string;
  userId?: string;
  rating?: number;
  status?: string;
}

export const reviewService = {
  /**
   * Lấy danh sách review với phân trang
   */
  async getReviews(params: GetReviewsParams = {}): Promise<PagedResult<ReviewListDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<ReviewListDto>>(REVIEW_BASE_URL, {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy reviews của một sách
   */
  async getReviewsByBook(bookId: string, params: GetReviewsParams = {}): Promise<PagedResult<ReviewListDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<ReviewListDto>>(
        `${REVIEW_BASE_URL}/book/${bookId}`,
        {
          params: {
            pageNumber: params.pageNumber || 1,
            pageSize: params.pageSize || 10,
            ...params,
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy reviews của người dùng hiện tại
   */
  async getMyReviews(params: GetReviewsParams = {}): Promise<PagedResult<ReviewDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<ReviewDto>>(`${REVIEW_BASE_URL}/my-reviews`, {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thống kê review của sách
   */
  async getReviewStatistics(bookId: string): Promise<ReviewStatisticsDto> {
    try {
      const response = await axiosInstance.get<ReviewStatisticsDto>(
        `${REVIEW_BASE_URL}/book/${bookId}/statistics`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết review
   */
  async getReviewById(id: string): Promise<ReviewDto> {
    try {
      const response = await axiosInstance.get<ReviewDto>(`${REVIEW_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo review mới
   */
  async createReview(bookId: string, dto: CreateReviewDto): Promise<ReviewDto> {
    try {
      const response = await axiosInstance.post<ReviewDto>(`${REVIEW_BASE_URL}/book/${bookId}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh giá nhanh (chỉ rating, không có content)
   */
  async quickRating(bookId: string, dto: QuickRatingDto): Promise<ReviewDto> {
    try {
      const response = await axiosInstance.post<ReviewDto>(`${REVIEW_BASE_URL}/book/${bookId}/quick-rating`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật review
   */
  async updateReview(id: string, dto: UpdateReviewDto): Promise<ReviewDto> {
    try {
      const response = await axiosInstance.put<ReviewDto>(`${REVIEW_BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa review
   */
  async deleteReview(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${REVIEW_BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra user có thể review sách này không
   */
  async canReview(bookId: string): Promise<{ canReview: boolean; reason?: string }> {
    try {
      const response = await axiosInstance.get<{ canReview: boolean; reason?: string }>(
        `${REVIEW_BASE_URL}/book/${bookId}/can-review`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
