import axiosInstance, { handleApiError } from '@/lib/axios';

const IMAGE_BASE_URL = '/api/images';

export const bookImagesService = {
  /**
   * Lấy tất cả images
   */
  async getAllImages(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(IMAGE_BASE_URL, { params });
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
      const response = await axiosInstance.get(`${IMAGE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật image
   */
  async updateImage(id: string, dto: { url?: string; altText?: string; isPrimary?: boolean }): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${IMAGE_BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa image
   */
  async deleteImage(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${IMAGE_BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy images của sách
   */
  async getBookImages(bookId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`/api/books/${bookId}/images`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa tất cả images của sách
   */
  async deleteBookImages(bookId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/books/${bookId}/images`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy cover image của sách
   */
  async getBookCover(bookId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`/api/books/${bookId}/images/cover`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật cover image
   */
  async updateBookCover(bookId: string, imageUrl: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`/api/books/${bookId}/images/cover`, { imageUrl });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload image cho sách
   */
  async uploadBookImage(bookId: string, file: File, isPrimary: boolean = false): Promise<unknown> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isPrimary', isPrimary.toString());

      const response = await axiosInstance.post(`/api/books/${bookId}/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload nhiều images cho sách
   */
  async uploadBatchBookImages(bookId: string, files: File[]): Promise<unknown> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await axiosInstance.post(`/api/books/${bookId}/images/upload/batch`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
