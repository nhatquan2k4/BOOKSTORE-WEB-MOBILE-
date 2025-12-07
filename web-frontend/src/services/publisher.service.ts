import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { PublisherDto } from '@/types/dtos';

const PUBLISHER_BASE_URL = '/api/publisher';

export const publisherService = {
  /**
   * Lấy danh sách nhà xuất bản với phân trang
   */
  async getPublishers(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Promise<PagedResult<PublisherDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<PublisherDto>>(PUBLISHER_BASE_URL, {
        params: { pageNumber, pageSize, searchTerm },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết nhà xuất bản
   */
  async getPublisherById(id: string): Promise<PublisherDto> {
    try {
      const response = await axiosInstance.get<PublisherDto>(`${PUBLISHER_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
