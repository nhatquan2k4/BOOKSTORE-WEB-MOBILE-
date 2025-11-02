// Books API
import api from './axios';
import { API_ENDPOINTS } from './endpoints';
import type { Book, GetBooksParams, GetBooksResponse } from '@/types/book';

export const booksApi = {
  /**
   * Get all books with pagination and filters
   */
  getAll: async (params?: GetBooksParams): Promise<GetBooksResponse> => {
    return api.get(API_ENDPOINTS.BOOKS.BASE, { params });
  },

  /**
   * Get book by ID with full details
   */
  getById: async (id: string): Promise<Book> => {
    return api.get(API_ENDPOINTS.BOOKS.BY_ID(id));
  },

  /**
   * Search books by query
   */
  search: async (query: string): Promise<Book[]> => {
    return api.get(API_ENDPOINTS.BOOKS.SEARCH, { 
      params: { q: query } 
    });
  },

  /**
   * Get books by category
   */
  getByCategory: async (categoryId: string, params?: GetBooksParams): Promise<GetBooksResponse> => {
    return api.get(API_ENDPOINTS.BOOKS.BY_CATEGORY(categoryId), { params });
  },

  /**
   * Get books by author
   */
  getByAuthor: async (authorId: string, params?: GetBooksParams): Promise<GetBooksResponse> => {
    return api.get(API_ENDPOINTS.BOOKS.BY_AUTHOR(authorId), { params });
  },
};
