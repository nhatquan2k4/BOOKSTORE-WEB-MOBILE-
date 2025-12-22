import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { Author } from '../types';

interface AuthorListResponse {
    items: Author[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

class AuthorService {
    async getAll(params?: { page?: number; pageSize?: number; search?: string }) {
        try {
            // Map frontend params to backend API params
            const apiParams = {
                pageNumber: params?.page || 1,
                pageSize: params?.pageSize || 10,
                searchTerm: params?.search || undefined
            };
            console.log('Author API params:', apiParams);
            const response = await apiClient.get<AuthorListResponse>(API_ENDPOINTS.AUTHOR.LIST, { params: apiParams });
            console.log('Author API response:', response.data);
            return response.data || { items: [], totalCount: 0, pageNumber: 1, pageSize: 10 };
        } catch (error) {
            console.error('Error in authorService.getAll:', error);
            throw error;
        }
    }

    async getById(id: string) {
        const response = await apiClient.get<Author>(API_ENDPOINTS.AUTHOR.GET_BY_ID(id));
        return response.data;
    }

    async create(author: Omit<Author, 'id' | 'bookCount'>) {
        const response = await apiClient.post<Author>(API_ENDPOINTS.AUTHOR.CREATE, author);
        return response.data;
    }

    async update(id: string, author: Partial<Omit<Author, 'id' | 'bookCount'>>) {
        const response = await apiClient.put<Author>(API_ENDPOINTS.AUTHOR.UPDATE(id), author);
        return response.data;
    }

    async delete(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.AUTHOR.DELETE(id));
        return response.data;
    }
}

export default new AuthorService();
