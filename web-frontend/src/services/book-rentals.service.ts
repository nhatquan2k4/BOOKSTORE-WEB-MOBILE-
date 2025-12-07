import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/book-rentals';

export interface CreateRentalDto {
  bookId: string;
  userId: string;
  rentalPlanId: string;
  startDate?: string;
}

export interface UpdateRentalDto {
  status?: 'Active' | 'Expired' | 'Cancelled' | 'Returned';
  actualReturnDate?: string;
  notes?: string;
}

export const bookRentalsService = {
  /**
   * Lấy tất cả rentals
   */
  async getAllRentals(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo rental mới
   */
  async createRental(dto: CreateRentalDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy rental theo ID
   */
  async getRentalById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật rental
   */
  async updateRental(id: string, dto: UpdateRentalDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa rental
   */
  async deleteRental(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy rentals theo user
   */
  async getRentalsByUser(userId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy rentals active của user
   */
  async getUserActiveRentals(userId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/user/${userId}/active`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy rentals theo book
   */
  async getRentalsByBook(bookId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/book/${bookId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy rentals theo trạng thái
   */
  async getRentalsByStatus(status: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/status/${status}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy rentals hết hạn
   */
  async getExpiredRentals(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/expired`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Gia hạn rental
   */
  async extendRental(id: string, extensionDays: number): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${id}/extend`, { extensionDays });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hủy rental
   */
  async cancelRental(id: string, reason?: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh dấu rental đã trả
   */
  async markAsReturned(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/returned`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra user có đang thuê sách không
   */
  async checkUserHasActiveRental(userId: string, bookId: string): Promise<{ hasActiveRental: boolean }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/check-active`, {
        params: { userId, bookId },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thống kê rentals
   */
  async getRentalStatistics(): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
