import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Users';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleId?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export const usersService = {
  /**
   * Lấy tất cả users
   */
  async getAllUsers(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo user mới
   */
  async createUser(dto: CreateUserDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy user theo ID
   */
  async getUserById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật user
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy user theo email
   */
  async getUserByEmail(email: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/by-email/${email}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy user theo username
   */
  async getUserByUsername(username: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/by-username/${username}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tìm kiếm users
   */
  async searchUsers(keyword: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/search`, {
        params: { keyword, ...params },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy roles của user
   */
  async getUserRoles(userId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${userId}/roles`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thêm role vào user
   */
  async addRoleToUser(userId: string, roleId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa role khỏi user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${userId}/roles/${roleId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${userId}/change-password`, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Reset mật khẩu
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/reset-password`, { email });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Khóa/mở khóa user
   */
  async toggleUserStatus(userId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thống kê user
   */
  async getUserStatistics(userId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${userId}/statistics`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
