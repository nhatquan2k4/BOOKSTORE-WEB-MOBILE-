import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Shippers';

export interface CreateShipperDto {
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateShipperDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export const shippersService = {
  /**
   * Lấy tất cả shippers
   */
  async getAllShippers(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo shipper mới
   */
  async createShipper(dto: CreateShipperDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shippers có phân trang
   */
  async getPagedShippers(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/paged`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shipper theo ID
   */
  async getShipperById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật shipper
   */
  async updateShipper(id: string, dto: UpdateShipperDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa shipper
   */
  async deleteShipper(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shippers đang hoạt động
   */
  async getActiveShippers(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/active`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thống kê của shipper
   */
  async getShipperStatistics(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}/statistics`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shipments của shipper
   */
  async getShipperShipments(id: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}/shipments`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tìm kiếm shipper theo tên hoặc số điện thoại
   */
  async searchShippers(keyword: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/search`, {
        params: { keyword },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
