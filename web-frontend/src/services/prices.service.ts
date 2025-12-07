import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Prices';

export interface CreatePriceDto {
  bookId: string;
  price: number;
  salePrice?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdatePriceDto {
  price?: number;
  salePrice?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface BulkUpdatePriceDto {
  bookIds: string[];
  price?: number;
  salePrice?: number;
  discountPercentage?: number;
}

export const pricesService = {
  /**
   * Lấy tất cả prices
   */
  async getAllPrices(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo price mới
   */
  async createPrice(dto: CreatePriceDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy price hiện tại của sách
   */
  async getBookPrice(bookId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/book/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật price của sách
   */
  async updateBookPrice(bookId: string, dto: UpdatePriceDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/book/${bookId}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy lịch sử giá của sách
   */
  async getBookPriceHistory(bookId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/book/${bookId}/history`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật giá hàng loạt
   */
  async bulkUpdatePrices(dto: BulkUpdatePriceDto): Promise<{ updatedCount: number }> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/bulk-update`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
