// Book Service - API calls for books
import { api } from './apiClient';
import { API_ENDPOINTS, API_BASE_URL, MINIO_BASE_URL } from '../config/api';
import priceService from './priceService';
import type { Book, BookDetail, BookListResponse, GetBooksParams } from '../types/book';

/**
 * Get list of books with pagination
 */
export const getBooks = async (params?: GetBooksParams): Promise<BookListResponse> => {
  try {
    const response = await api.get<BookListResponse>(API_ENDPOINTS.BOOKS.LIST, { params });
    return response;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

/**
 * Get book by ID with full details
 */
export const getBookById = async (id: string): Promise<BookDetail> => {
  const book = await api.get<BookDetail>(
    API_ENDPOINTS.BOOKS.GET_BY_ID(id)
  );

  try {
    const priceDto = await priceService.getPriceByBookId(id);
    if (priceDto?.price) {
      (book as any).currentPrice = priceDto.price;
      (book as any).currency = priceDto.currency ?? 'VND';
    }
  } catch (e) {
    console.warn('Price service failed', e);
  }

  return book;
};



/**
 * Search books by keyword
 */
export const searchBooks = async (searchTerm: string, top: number = 50): Promise<Book[]> => {
  try {
    const response = await api.get<Book[]>(API_ENDPOINTS.BOOKS.SEARCH, {
      params: { searchTerm, top },
    });
    return response;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

/**
 * Get books by category
 */
export const getBooksByCategory = async (
  categoryId: string,
  params?: GetBooksParams
): Promise<BookListResponse> => {
  try {
    const response = await api.get<BookListResponse>(
      API_ENDPOINTS.BOOKS.BY_CATEGORY(categoryId),
      { params }
    );
    return response;
  } catch (error) {
    console.error(`Error fetching books for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Get book images
 */
export const getBookImages = async (bookId: string): Promise<any[]> => {
  try {
    const response = await api.get<any[]>(API_ENDPOINTS.BOOK_IMAGES.BY_BOOK(bookId));

    // Smart URL resolution: Handle both relative paths and full URLs
    const normalizeImageUrl = (url: string) => {
      if (!url || typeof url !== 'string') return url;

      // If relative path (starts with /), prepend MINIO_BASE_URL (not API_BASE_URL!)
      if (url.startsWith('/')) {
        return `${MINIO_BASE_URL}${url}`;
      }
      // If URL points to localhost or loopback, replace with MinIO host
      else if (url.startsWith('http') && (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0'))) {
        try {
          const minioHost = new URL(MINIO_BASE_URL).hostname;
          return url.replace(/localhost|127\.0\.0\.1|0\.0\.0\.0/g, minioHost).replace(':9000', `:${new URL(MINIO_BASE_URL).port || '9000'}`);
        } catch {
          return url;
        }
      }

      return url;
    };

    return response.map(img => ({ ...img, imageUrl: normalizeImageUrl(img.imageUrl) }));
  } catch (error) {
    console.error(`Error fetching images for book ${bookId}:`, error);
    return [];
  }
};

/**
 * Get book cover image
 */
export const getBookCover = async (bookId: string): Promise<any> => {
  try {
    const response = await api.get<any>(API_ENDPOINTS.BOOK_IMAGES.COVER(bookId));

    if (!response) return null;

    // Smart URL resolution: Handle both relative paths and full URLs
    const normalizeImageUrl = (url: string) => {
      if (!url || typeof url !== 'string') return url;
      
      // If relative path (starts with /), prepend MINIO_BASE_URL (not API_BASE_URL!)
      if (url.startsWith('/')) {
        return `${MINIO_BASE_URL}${url}`;
      }
      // If URL points to localhost, replace with MinIO host
      else if (url.startsWith('http') && (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0'))) {
        try {
          const minioHost = new URL(MINIO_BASE_URL).hostname;
          return url.replace(/localhost|127\.0\.0\.1|0\.0\.0\.0/g, minioHost).replace(':9000', `:${new URL(MINIO_BASE_URL).port || '9000'}`);
        } catch {
          return url;
        }
      }
      return url;
    };

    return { ...response, imageUrl: normalizeImageUrl(response.imageUrl) };
  } catch (error) {
    console.error(`Error fetching cover for book ${bookId}:`, error);
    return null;
  }
};

export const bookService = {
  getBooks,
  getBookById,
  searchBooks,
  getBooksByCategory,
  getBookImages,
  getBookCover,
};

export default bookService;
