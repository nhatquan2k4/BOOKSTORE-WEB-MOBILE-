import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { BookDto, BookDetailDto, CreateBookDto, UpdateBookDto } from '@/types/dtos';

const BOOK_BASE_URL = '/api/book';

export interface GetBooksParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  isAvailable?: boolean;
}

export const bookService = {
  /**
   * Lấy danh sách sách với phân trang và lọc
   */
  async getBooks(params: GetBooksParams = {}): Promise<PagedResult<BookDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<BookDto>>(BOOK_BASE_URL, {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết sách theo ID
   */
  async getBookById(id: string): Promise<BookDetailDto> {
    try {
      const response = await axiosInstance.get<BookDetailDto>(`${BOOK_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy sách theo ISBN
   */
  async getBookByISBN(isbn: string): Promise<BookDetailDto> {
    try {
      const response = await axiosInstance.get<BookDetailDto>(`${BOOK_BASE_URL}/by-isbn/${isbn}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách sách theo danh mục
   */
  async getBooksByCategory(categoryId: string, top: number = 10): Promise<BookDto[]> {
    try {
      const response = await axiosInstance.get<BookDto[]>(
        `${BOOK_BASE_URL}/by-category/${categoryId}`,
        { params: { top } }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách sách theo tác giả
   */
  async getBooksByAuthor(authorId: string, top: number = 10): Promise<BookDto[]> {
    try {
      const response = await axiosInstance.get<BookDto[]>(
        `${BOOK_BASE_URL}/by-author/${authorId}`,
        { params: { top } }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách sách theo nhà xuất bản
   */
  async getBooksByPublisher(publisherId: string, top: number = 10): Promise<BookDto[]> {
    try {
      const response = await axiosInstance.get<BookDto[]>(
        `${BOOK_BASE_URL}/by-publisher/${publisherId}`,
        { params: { top } }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy sách bán chạy
   */
  async getBestSellingBooks(top: number = 10): Promise<BookDto[]> {
    try {
      const response = await axiosInstance.get<BookDto[]>(`${BOOK_BASE_URL}/best-selling`, {
        params: { top },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy sách mới nhất
   */
  async getNewestBooks(top: number = 10): Promise<BookDto[]> {
    try {
      const response = await axiosInstance.get<BookDto[]>(`${BOOK_BASE_URL}/newest`, {
        params: { top },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy sách được xem nhiều nhất
   */
  async getMostViewedBooks(top: number = 10): Promise<BookDto[]> {
    try {
      const response = await axiosInstance.get<BookDto[]>(`${BOOK_BASE_URL}/most-viewed`, {
        params: { top },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo sách mới (Admin only)
   */
  async createBook(dto: CreateBookDto): Promise<BookDetailDto> {
    try {
      const response = await axiosInstance.post<BookDetailDto>(BOOK_BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật sách (Admin only)
   */
  async updateBook(id: string, dto: UpdateBookDto): Promise<BookDetailDto> {
    try {
      const response = await axiosInstance.put<BookDetailDto>(`${BOOK_BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa sách (Admin only)
   */
  async deleteBook(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BOOK_BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
