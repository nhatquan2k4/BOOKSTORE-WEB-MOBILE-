import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { UserDto, UserSummaryDto, UserProfileDto, UserAddressDto, CreateUserAddressDto, UpdateUserAddressDto } from '@/types/dtos';

const USER_BASE_URL = '/api/users';
const PROFILE_BASE_URL = '/api/userprofile';

export const userService = {
  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<UserDto> {
    try {
      const response = await axiosInstance.get<UserDto>(`${USER_BASE_URL}/me`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thông tin user theo ID
   */
  async getUserById(id: string): Promise<UserDto> {
    try {
      const response = await axiosInstance.get<UserDto>(`${USER_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách users (Admin only)
   */
  async getUsers(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Promise<PagedResult<UserSummaryDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<UserSummaryDto>>(USER_BASE_URL, {
        params: { pageNumber, pageSize, searchTerm },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật profile
   */
  async updateProfile(dto: Partial<UserProfileDto>): Promise<UserProfileDto> {
    try {
      const response = await axiosInstance.put<UserProfileDto>(PROFILE_BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post<{ avatarUrl: string }>(
        `${PROFILE_BASE_URL}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const addressService = {
  /**
   * Lấy danh sách địa chỉ của user
   */
  async getMyAddresses(): Promise<UserAddressDto[]> {
    try {
      const response = await axiosInstance.get<UserAddressDto[]>(`${PROFILE_BASE_URL}/addresses`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy địa chỉ mặc định
   */
  async getDefaultAddress(): Promise<UserAddressDto | null> {
    try {
      const response = await axiosInstance.get<UserAddressDto | null>(`${PROFILE_BASE_URL}/addresses/default`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thêm địa chỉ mới
   */
  async createAddress(dto: CreateUserAddressDto): Promise<UserAddressDto> {
    try {
      const response = await axiosInstance.post<UserAddressDto>(`${PROFILE_BASE_URL}/addresses`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(id: string, dto: UpdateUserAddressDto): Promise<UserAddressDto> {
    try {
      const response = await axiosInstance.put<UserAddressDto>(`${PROFILE_BASE_URL}/addresses/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${PROFILE_BASE_URL}/addresses/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(id: string): Promise<void> {
    try {
      await axiosInstance.put(`${PROFILE_BASE_URL}/addresses/${id}/set-default`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
