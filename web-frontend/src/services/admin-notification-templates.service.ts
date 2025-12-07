import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/admin/notification-templates';

export interface CreateNotificationTemplateDto {
  code: string;
  name: string;
  subject?: string;
  body: string;
  isActive?: boolean;
}

export interface UpdateNotificationTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export const adminNotificationTemplatesService = {
  /**
   * Lấy danh sách templates
   */
  async getTemplates(params?: {
    page?: number;
    pageSize?: number;
    code?: string;
    isActive?: boolean;
    searchTerm?: string;
  }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo template mới
   */
  async createTemplate(dto: CreateNotificationTemplateDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy template theo ID
   */
  async getTemplateById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật template
   */
  async updateTemplate(id: string, dto: UpdateNotificationTemplateDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy template theo code
   */
  async getTemplateByCode(code: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/by-code/${code}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách templates active
   */
  async getActiveTemplates(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/active`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
