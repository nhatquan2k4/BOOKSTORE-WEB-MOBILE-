import axiosInstance, { handleApiError } from '@/lib/axios';

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export const bookCommentsService = {
  /**
   * Tạo comment cho sách
   */
  async createComment(bookId: string, dto: CreateCommentDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`/api/books/${bookId}/comments`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách comments của sách
   */
  async getBookComments(bookId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`/api/books/${bookId}/comments`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
