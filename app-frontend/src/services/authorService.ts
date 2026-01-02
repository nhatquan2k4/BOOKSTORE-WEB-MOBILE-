// Author Service - API calls for authors
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { Author, AuthorListResponse, GetAuthorsParams } from '../types/author';

/**
 * Get list of all authors
 */
export const getAuthors = async (params?: GetAuthorsParams): Promise<AuthorListResponse> => {
  try {
    const response = await api.get<AuthorListResponse>(API_ENDPOINTS.AUTHORS.LIST, { params });
    return response;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};

/**
 * Get author by ID
 */
export const getAuthorById = async (id: string): Promise<Author> => {
  try {
    const response = await api.get<Author>(API_ENDPOINTS.AUTHORS.GET_BY_ID(id));
    return response;
  } catch (error) {
    console.error(`Error fetching author ${id}:`, error);
    throw error;
  }
};

/**
 * Search authors by name
 */
export const searchAuthors = async (searchTerm: string): Promise<Author[]> => {
  try {
    const response = await api.get<Author[]>(API_ENDPOINTS.AUTHORS.SEARCH, {
      params: { searchTerm },
    });
    return response;
  } catch (error) {
    console.error('Error searching authors:', error);
    throw error;
  }
};

export default {
  getAuthors,
  getAuthorById,
  searchAuthors,
};
