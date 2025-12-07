import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/admin/reviews';

export const adminReviewsService = {
  /**
   * Lấy danh sách reviews pending
   */
  async getPendingReviews(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/pending`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy review theo ID
   */
  async getReviewById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
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
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Duyệt review
   */
  async approveReview(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Từ chối review
   */
  async rejectReview(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/reject`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
