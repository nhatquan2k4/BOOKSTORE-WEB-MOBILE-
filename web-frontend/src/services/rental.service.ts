import axiosInstance, { handleApiError } from '@/lib/axios';
import { 
  CreateBookRentalDto, 
  RenewBookRentalDto,
  BookRentalDto 
} from '@/types/dtos';

// Route chính xác từ Controller: [Route("api/rental/rentals")]
const BASE_URL = '/api/rental/rentals';

export const rentalService = {
  /**
   * Thuê sách (có thanh toán)
   * POST: api/rental/rentals/rent
   */
  async rentBook(data: CreateBookRentalDto) {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/rent`, 
        data
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * [TESTING ONLY] Thuê sách giả lập (không thanh toán)
   * POST: api/rental/rentals/rent-mock
   */
  async rentBookMock(bookId: string, rentalPlanId: string) {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/rent-mock`,
        { bookId, rentalPlanId }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách sách đang thuê của tôi
   * GET: api/rental/rentals/my
   */
  async getMyRentals(includeExpired = false) {
    try {
      // Backend trả về List<BookRentalDto> trực tiếp
      const response = await axiosInstance.get<BookRentalDto[]>(
        `${BASE_URL}/my`, 
        { params: { includeExpired } }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết lượt thuê
   * GET: api/rental/rentals/{id}
   */
  async getRentalById(id: string) {
    try {
      const response = await axiosInstance.get<BookRentalDto>(
        `${BASE_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Gia hạn sách
   * POST: api/rental/rentals/{id}/renew
   */
  async renewRental(id: string, data: RenewBookRentalDto) {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/${id}/renew`, 
        data
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Trả sách sớm
   * POST: api/rental/rentals/{id}/return
   */
  async returnBook(id: string) {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/${id}/return`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra quyền đọc sách
   * GET: api/rental/rentals/{bookId}/check-access
   */
  async checkBookAccess(bookId: string) {
    try {
      const response = await axiosInstance.get<{ hasAccess: boolean, message?: string }>(
        `${BASE_URL}/${bookId}/check-access`
      );
      return response.data;
    } catch (error) {
      // Nếu lỗi 403/404 coi như không có quyền
      return { hasAccess: false };
    }
  },

  /**
   * Lấy link đọc sách (Pre-signed URL)
   * GET: api/rental/rentals/{bookId}/access-link
   */
  async getAccessLink(bookId: string) {
    try {
      const response = await axiosInstance.get<{ url: string }>(
        `${BASE_URL}/${bookId}/access-link`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};