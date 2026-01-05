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
   * Upload Avatar
   * Route: POST /api/UserProfile/profile/avatar
   */
  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

  // Do not set Content-Type header manually for multipart/form-data —
  // the browser/axios will add the correct boundary when sending FormData.
      // Use transformRequest to ensure Content-Type header is removed for this
      // request so the browser can set the correct multipart boundary.
      const response = await axiosInstance.post(`${BASE_URL}/profile/avatar`, formData, {
        transformRequest: [(data: any, headers: any) => {
          if (headers) {
            // Remove any content-type header so browser sets boundary automatically
            delete headers['Content-Type'];
            delete headers['content-type'];
          }
          return data;
        }],
      });

      // Controller returns { Success: true, Message: ..., Data: { AvatarUrl: "...", FileName: ..., Size: ... } }
      const resData = response.data as any;
      // Log full response for debugging
      // eslint-disable-next-line no-console
      console.log('[userProfileService] uploadAvatar response:', resData);

      if (resData && (resData.Success === true || resData.success === true)) {
        const avatarUrl = resData.Data?.AvatarUrl || resData.Data?.avatarUrl || null;
        return { success: true, avatarUrl, message: resData.Message || resData.message || 'OK' };
      }

      return { success: false, message: resData?.Message || resData?.message || 'Upload failed' };
    } catch (error: any) {
      // Debug: log error details to help trace upload failures
      // eslint-disable-next-line no-console
      console.error('[userProfileService] uploadAvatar error:', error?.response?.data || error.message || error);

      // Return structured failure instead of throwing so caller can handle UI accordingly
      const status = error?.response?.status;
      const data = error?.response?.data;
      const message = data?.Message || data?.message || (status ? `Request failed with status code ${status}` : error.message || 'Upload error');
      return { success: false, message };
    }
  },

  /**
   * Delete Avatar
   * Route: DELETE /api/UserProfile/profile/avatar
   */
  async deleteAvatar(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/profile/avatar`);
      const resData = response.data as any;
      if (resData && resData.Success) {
        return { success: true, message: resData.Message || 'Deleted' };
      }
      return { success: false, message: resData?.Message || 'Delete failed' };
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