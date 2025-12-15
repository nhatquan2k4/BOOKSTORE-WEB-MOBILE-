import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/BookImage';

export interface CreateBookImageDto {
  bookId: string;
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface UpdateBookImageDto {
  imageUrl?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export const bookImageService = {
  /**
   * Tạo image mới cho sách
   */
  async createBookImage(dto: CreateBookImageDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy image theo ID
   */
  async getImageById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật book image
   */
  async updateBookImage(id: string, dto: UpdateBookImageDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa book image
   */
  async deleteBookImage(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
