import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/rental/books';

export const rentalEbooksService = {
  /**
   * Upload ebook file cho sách
   */
  async uploadEbook(bookId: string, file: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`${BASE_URL}/${bookId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy link truy cập ebook
   */
  async getAccessLink(bookId: string): Promise<{ accessUrl: string; expiresAt: string }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${bookId}/access-link`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra ebook có tồn tại không
   */
  async checkEbookExists(bookId: string): Promise<{ exists: boolean }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${bookId}/exists`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa ebook
   */
  async deleteEbook(bookId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${bookId}/ebook`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload ebook dạng ZIP
   */
  async uploadEbookZip(bookId: string, file: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`${BASE_URL}/${bookId}/upload-zip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload ebook dạng CBZ (Comic Book ZIP)
   */
  async uploadEbookCbz(bookId: string, file: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`${BASE_URL}/${bookId}/upload-cbz`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách chapters
   */
  async getChapters(bookId: string): Promise<{ chapters: string[] }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${bookId}/chapters`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách pages của chapter
   */
  async getChapterPages(bookId: string, chapterName: string): Promise<{ pages: string[] }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${bookId}/chapters/${chapterName}/pages`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
