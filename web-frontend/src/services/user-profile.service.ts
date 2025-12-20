import axiosInstance, { handleApiError } from '@/lib/axios';
import { 
  ApiResponse, 
  UserProfile, 
  UpdateUserProfileDto, 
  UserAddress, 
  CreateUserAddressDto 
} from '@/types/dtos/userprofile'; // Hãy chắc chắn đường dẫn import đúng với project của bạn

const BASE_URL = '/api/UserProfile';

export const userProfileService = {
  /**
   * Lấy profile của user hiện tại
   * Route: GET /api/UserProfile/profile
   */
  async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/profile`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật profile
   * Route: PUT /api/UserProfile/profile
   */
  async updateMyProfile(dto: UpdateUserProfileDto): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/profile`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload Avatar (MỚI THÊM)
   * Route: POST /api/UserProfile/avatar
   */
  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; message?: string }> {
    try {
      const formData = new FormData();
      // 'file' ở đây phải khớp tên tham số trong Controller (IFormFile file)
      formData.append('file', file); 

      const response = await axiosInstance.post(`${BASE_URL}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Bắt buộc header này để upload file
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách địa chỉ
   * Route: GET /api/UserProfile/addresses
   */
  async getMyAddresses(): Promise<ApiResponse<UserAddress[]>> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/addresses`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thêm địa chỉ mới
   * Route: POST /api/UserProfile/addresses
   */
  async addAddress(dto: CreateUserAddressDto): Promise<ApiResponse<UserAddress>> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/addresses`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đặt địa chỉ mặc định
   * Route: PUT /api/UserProfile/addresses/{id}/set-default
   */
  async setDefaultAddress(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/addresses/${id}/set-default`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa địa chỉ
   * Route: DELETE /api/UserProfile/addresses/{id}
   */
  async deleteAddress(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/addresses/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật địa chỉ
   * Route: PUT /api/UserProfile/addresses/{id}
   */
  async updateAddress(id: string, dto: any): Promise<ApiResponse<any>> {
      try {
        const response = await axiosInstance.put(`${BASE_URL}/addresses/${id}`, dto);
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
  }
};