import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Subscriptions';

export interface CreateSubscriptionDto {
  userId: string;
  planId: string;
  startDate?: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  status?: 'Active' | 'Cancelled' | 'Expired' | 'Suspended';
  endDate?: string;
}

export const subscriptionsService = {
  /**
   * Lấy tất cả subscriptions
   */
  async getAllSubscriptions(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo subscription mới
   */
  async createSubscription(dto: CreateSubscriptionDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy subscription theo ID
   */
  async getSubscriptionById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật subscription
   */
  async updateSubscription(id: string, dto: UpdateSubscriptionDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa subscription
   */
  async deleteSubscription(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy subscriptions của user
   */
  async getUserSubscriptions(userId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy subscription active của user
   */
  async getUserActiveSubscription(userId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/user/${userId}/active`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hủy subscription
   */
  async cancelSubscription(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/cancel`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Gia hạn subscription
   */
  async renewSubscription(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/renew`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
