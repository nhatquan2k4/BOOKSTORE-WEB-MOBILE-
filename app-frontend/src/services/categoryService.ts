// Category Service - API calls for categories
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetCategoriesParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

/**
 * Get list of all categories
 */
export const getCategories = async (params?: GetCategoriesParams): Promise<CategoryListResponse> => {
  try {
    const response = await api.get<CategoryListResponse>(API_ENDPOINTS.CATEGORIES.LIST, { params });
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await api.get<Category>(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
    return response;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
};
