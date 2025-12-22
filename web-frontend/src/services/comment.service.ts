import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { 
  CommentDto, 
  CreateCommentDto 
} from '@/types/dtos';

export const commentService = {
  /**
   * Lấy danh sách bình luận của sách
   * URL: GET /api/books/{bookId}/comments
   */
  async getBookComments(bookId: string, page = 1, pageSize = 10) {
    try {
      const response = await axiosInstance.get<{ success: boolean, data: PagedResult<CommentDto> }>(
        `/api/books/${bookId}/comments`,
        { params: { page, pageSize } }
      );
      // Backend trả về: { success: true, data: { comments: [], pagination: {} } }
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo bình luận mới (Hoặc trả lời bình luận)
   * URL: POST /api/books/{bookId}/comments
   * Lưu ý: Logic trả lời (reply) phụ thuộc vào field `parentCommentId` trong DTO
   */
  async createComment(data: { bookId: string } & CreateCommentDto) {
    try {
      const response = await axiosInstance.post<{ success: boolean, data: CommentDto }>(
        `/api/books/${data.bookId}/comments`, 
        { 
            content: data.content, 
            parentCommentId: data.parentCommentId 
        }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // NOTE: Controller hiện tại của bạn CHƯA CÓ endpoint lấy replies riêng lẻ
  // Nên hàm getReplies sẽ phải filter từ danh sách comments đã lấy hoặc gọi lại API getBookComments
  // Tạm thời ta dùng hàm giả lập này để frontend không bị lỗi build
  async getReplies(commentId: string) {
      // Vì controller BookCommentsController không có endpoint "GetReplies"
      // Ta trả về mảng rỗng để tránh lỗi runtime, hoặc bạn cần bổ sung endpoint này ở Backend
      return []; 
  }
};