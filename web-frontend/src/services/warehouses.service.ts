import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Warehouses';

export interface CreateWarehouseDto {
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  capacity?: number;
  isActive?: boolean;
}

export const warehousesService = {
  /**
   * Lấy tất cả warehouses
   */
  async getAllWarehouses(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo warehouse mới
   */
  async createWarehouse(dto: CreateWarehouseDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy warehouse theo ID
   */
  async getWarehouseById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật warehouse
   */
  async updateWarehouse(id: string, dto: UpdateWarehouseDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa warehouse
   */
  async deleteWarehouse(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
