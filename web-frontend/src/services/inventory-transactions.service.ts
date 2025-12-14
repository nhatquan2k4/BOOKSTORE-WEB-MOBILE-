import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/InventoryTransactions';

export interface CreateInventoryTransactionDto {
  warehouseId: string;
  bookId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUST';
  notes?: string;
}

export const inventoryTransactionsService = {
  /**
   * Lấy tất cả transactions
   */
  async getAllTransactions(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo transaction mới
   */
  async createTransaction(dto: CreateInventoryTransactionDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy transactions theo warehouse
   */
  async getTransactionsByWarehouse(warehouseId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/warehouse/${warehouseId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy transactions theo book
   */
  async getTransactionsByBook(bookId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/book/${bookId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy transactions theo warehouse và book
   */
  async getTransactionsByWarehouseAndBook(
    warehouseId: string,
    bookId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/warehouse/${warehouseId}/book/${bookId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
