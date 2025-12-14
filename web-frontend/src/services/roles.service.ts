import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';

const BASE_URL = '/api/Roles';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export const rolesService = {
  /**
   * Lấy tất cả roles
   */
  async getAllRoles(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo role mới
   */
  async createRole(dto: CreateRoleDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy roles có phân trang
   */
  async getPagedRoles(pageNumber: number = 1, pageSize: number = 20): Promise<PagedResult<unknown>> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/paged`, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy role theo ID
   */
  async getRoleById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy role theo tên
   */
  async getRoleByName(name: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/by-name/${name}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy role với permissions
   */
  async getRoleWithPermissions(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}/with-permissions`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy permissions của role
   */
  async getRolePermissions(id: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}/permissions`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thêm permissions vào role
   */
  async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${roleId}/permissions`, { permissionIds });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa permission khỏi role
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${roleId}/permissions/${permissionId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra tên role có tồn tại không
   */
  async checkRoleName(name: string): Promise<{ exists: boolean }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/check-name/${name}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
