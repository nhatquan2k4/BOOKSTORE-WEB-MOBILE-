import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { Category } from '../types';

interface CategoryListResponse {
    items: Category[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

class CategoryService {
    async getAll(params?: { page?: number; pageSize?: number; search?: string }) {
        try {
            // Map frontend params to backend API params
            const apiParams = {
                pageNumber: params?.page || 1,
                pageSize: params?.pageSize || 10,
                searchTerm: params?.search || undefined
            };
            console.log('Category API params:', apiParams);
            const response = await apiClient.get<CategoryListResponse>(API_ENDPOINTS.CATEGORY.LIST, { params: apiParams });
            console.log('Category API response:', response.data);
            return response.data || { items: [], totalCount: 0, pageNumber: 1, pageSize: 10 };
        } catch (error) {
            console.error('Error in categoryService.getAll:', error);
            throw error;
        }
    }

    async getById(id: string) {
        const response = await apiClient.get<Category>(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));
        return response.data;
    }

    async create(category: Omit<Category, 'id' | 'bookCount' | 'subCategoriesCount' | 'parentName'>) {
        const response = await apiClient.post<Category>(API_ENDPOINTS.CATEGORY.CREATE, category);
        return response.data;
    }

    async update(id: string, category: Partial<Omit<Category, 'id' | 'bookCount' | 'subCategoriesCount' | 'parentName'>>) {
        const response = await apiClient.put<Category>(API_ENDPOINTS.CATEGORY.UPDATE(id), category);
        return response.data;
    }

    async delete(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.CATEGORY.DELETE(id));
        return response.data;
    }
}

export default new CategoryService();
