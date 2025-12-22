import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { Publisher } from '../types';

interface PublisherListResponse {
    items: Publisher[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

class PublisherService {
    async getAll(params?: { page?: number; pageSize?: number; search?: string }) {
        try {
            // Map frontend params to backend API params
            const apiParams = {
                pageNumber: params?.page || 1,
                pageSize: params?.pageSize || 10,
                searchTerm: params?.search || undefined
            };
            console.log('Publisher API params:', apiParams);
            const response = await apiClient.get<PublisherListResponse>(API_ENDPOINTS.PUBLISHER.LIST, { params: apiParams });
            console.log('Publisher API response:', response.data);
            return response.data || { items: [], totalCount: 0, pageNumber: 1, pageSize: 10 };
        } catch (error) {
            console.error('Error in publisherService.getAll:', error);
            throw error;
        }
    }

    async getById(id: string) {
        const response = await apiClient.get<Publisher>(API_ENDPOINTS.PUBLISHER.GET_BY_ID(id));
        return response.data;
    }

    async create(publisher: Omit<Publisher, 'id' | 'bookCount'>) {
        const response = await apiClient.post<Publisher>(API_ENDPOINTS.PUBLISHER.CREATE, publisher);
        return response.data;
    }

    async update(id: string, publisher: Partial<Omit<Publisher, 'id' | 'bookCount'>>) {
        const response = await apiClient.put<Publisher>(API_ENDPOINTS.PUBLISHER.UPDATE(id), publisher);
        return response.data;
    }

    async delete(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.PUBLISHER.DELETE(id));
        return response.data;
    }
}

export default new PublisherService();
