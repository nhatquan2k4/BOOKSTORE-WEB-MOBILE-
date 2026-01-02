// Category Service - API calls for categories
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { Category, CategoryListResponse, GetCategoriesParams } from '../types/category';

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

/**
 * Search categories by name
 */
export const searchCategories = async (searchTerm: string): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>(API_ENDPOINTS.CATEGORIES.SEARCH, {
      params: { searchTerm },
    });
    return response;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
  searchCategories,
};
