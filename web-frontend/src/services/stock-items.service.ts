import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/StockItems';

export interface CreateStockItemDto {
  warehouseId: string;
  bookId: string;
  quantity: number;
  reorderLevel?: number;
  reorderQuantity?: number;
}

export interface UpdateStockItemDto {
  quantity?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
}

export const stockItemsService = {
  /**
   * Lấy tất cả stock items
   */
  async getAllStockItems(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo stock item mới
   */
  async createStockItem(dto: CreateStockItemDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy stock item theo ID
   */
  async getStockItemById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật stock item
   */
  async updateStockItem(id: string, dto: UpdateStockItemDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa stock item
   */
  async deleteStockItem(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy stock items theo warehouse
   */
  async getStockItemsByWarehouse(warehouseId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/warehouse/${warehouseId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy stock items theo book
   */
  async getStockItemsByBook(bookId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/book/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy stock items có số lượng thấp (dưới reorder level)
   */
  async getLowStockItems(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/low-stock`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra tồn kho của sách
   */
  async checkBookStock(bookId: string): Promise<{ available: number; reserved: number; total: number }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/check-stock/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật số lượng stock
   */
  async updateStockQuantity(id: string, quantity: number): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/quantity`, { quantity });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Reserve stock cho đơn hàng
   */
  async reserveStock(bookId: string, quantity: number, orderId?: string): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/reserve`, { bookId, quantity, orderId });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Release stock reservation
   */
  async releaseStock(bookId: string, quantity: number, orderId?: string): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/release`, { bookId, quantity, orderId });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
