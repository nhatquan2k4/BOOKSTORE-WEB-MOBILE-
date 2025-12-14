import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/UserProfile';

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bio?: string;
  avatarUrl?: string;
}

export const userProfileService = {
  /**
   * Lấy profile của user hiện tại
   */
  async getCurrentUserProfile(): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật profile của user hiện tại
   */
  async updateCurrentUserProfile(dto: UpdateUserProfileDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy profile theo user ID
   */
  async getUserProfile(userId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật avatar
   */
  async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`${BASE_URL}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa avatar
   */
  async deleteAvatar(): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/avatar`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy địa chỉ giao hàng của user
   */
  async getShippingAddresses(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/shipping-addresses`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thêm địa chỉ giao hàng
   */
  async addShippingAddress(address: {
    name: string;
    phoneNumber: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    isDefault?: boolean;
  }): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/shipping-addresses`, address);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật địa chỉ giao hàng
   */
  async updateShippingAddress(addressId: string, address: Partial<{
    name: string;
    phoneNumber: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }>): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/shipping-addresses/${addressId}`, address);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa địa chỉ giao hàng
   */
  async deleteShippingAddress(addressId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/shipping-addresses/${addressId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
