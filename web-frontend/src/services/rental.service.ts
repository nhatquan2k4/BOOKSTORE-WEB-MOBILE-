import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { BookRentalDto, RentalPlanDto, EbookAccessDto } from '@/types/dtos';

const RENTAL_BASE_URL = '/api/bookrentals';
const RENTAL_PLAN_BASE_URL = '/api/rentalplans';
const EBOOK_BASE_URL = '/api/ebooks';

export const rentalService = {
  /**
   * Lấy danh sách rental của user hiện tại
   */
  async getMyRentals(status?: string, pageNumber: number = 1, pageSize: number = 20): Promise<PagedResult<BookRentalDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<BookRentalDto>>(`${RENTAL_BASE_URL}/my-rentals`, {
        params: { status, pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết rental
   */
  async getRentalById(id: string): Promise<BookRentalDto> {
    try {
      const response = await axiosInstance.get<BookRentalDto>(`${RENTAL_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thuê sách
   */
  async rentBook(bookId: string, rentalPlanId: string): Promise<BookRentalDto> {
    try {
      const response = await axiosInstance.post<BookRentalDto>(RENTAL_BASE_URL, {
        bookId,
        rentalPlanId,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Gia hạn thuê sách
   */
  async renewRental(rentalId: string, rentalPlanId: string): Promise<BookRentalDto> {
    try {
      const response = await axiosInstance.post<BookRentalDto>(`${RENTAL_BASE_URL}/${rentalId}/renew`, {
        rentalPlanId,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Trả sách
   */
  async returnBook(rentalId: string): Promise<void> {
    try {
      await axiosInstance.post(`${RENTAL_BASE_URL}/${rentalId}/return`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra quyền truy cập ebook
   */
  async checkEbookAccess(bookId: string): Promise<EbookAccessDto> {
    try {
      const response = await axiosInstance.get<EbookAccessDto>(`${EBOOK_BASE_URL}/check-access/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đọc ebook (lấy URL hoặc nội dung)
   */
  async readEbook(bookId: string): Promise<{ url: string }> {
    try {
      const response = await axiosInstance.get<{ url: string }>(`${EBOOK_BASE_URL}/read/${bookId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const rentalPlanService = {
  /**
   * Lấy danh sách gói thuê
   */
  async getRentalPlans(): Promise<RentalPlanDto[]> {
    try {
      const response = await axiosInstance.get<RentalPlanDto[]>(RENTAL_PLAN_BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết gói thuê
   */
  async getRentalPlanById(id: string): Promise<RentalPlanDto> {
    try {
      const response = await axiosInstance.get<RentalPlanDto>(`${RENTAL_PLAN_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
