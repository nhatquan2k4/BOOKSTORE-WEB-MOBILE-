import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Files';

export const filesService = {
  /**
   * Upload file chung
   */
  async uploadFile(file: File, folder?: string): Promise<{ url: string; fileName: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);

      const response = await axiosInstance.post(`${BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload ảnh sách
   */
  async uploadBookImages(files: File[]): Promise<{ urls: string[] }> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await axiosInstance.post(`${BASE_URL}/upload/book-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload file ebook
   */
  async uploadEbookFiles(files: File[]): Promise<{ urls: string[] }> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await axiosInstance.post(`${BASE_URL}/upload/ebook-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload avatar user
   */
  async uploadUserAvatar(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`${BASE_URL}/upload/user-avatars`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa file
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${encodeURIComponent(fileName)}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy presigned URL để download
   */
  async getPresignedUrl(fileName: string, expiresIn?: number): Promise<{ url: string }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/presigned-url/${fileName}`, {
        params: { expiresIn },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Download file
   */
  async downloadFile(fileName: string): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/download/${fileName}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
