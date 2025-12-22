import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { AuthorDto } from '@/types/dtos';

const AUTHOR_BASE_URL = '/api/author';

export const authorService = {
  /**
   * Lấy danh sách tác giả với phân trang
   */
  async getAuthors(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Promise<PagedResult<AuthorDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<AuthorDto>>(AUTHOR_BASE_URL, {
        params: { pageNumber, pageSize, searchTerm },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết tác giả
   */
  async getAuthorById(id: string): Promise<AuthorDto> {
    try {
      const response = await axiosInstance.get<AuthorDto>(`${AUTHOR_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy tác giả phổ biến
   */
  async getPopularAuthors(top: number = 10): Promise<AuthorDto[]> {
    try {
      const response = await axiosInstance.get<AuthorDto[]>(`${AUTHOR_BASE_URL}/popular`, {
        params: { top },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
