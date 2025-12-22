import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { Order } from '../types';

interface OrderListResponse {
    items?: Order[];
    data?: Order[];
    totalCount?: number;
    total?: number;
    pageNumber?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
}

interface OrderResponse {
    success: boolean;
    data: Order;
    message: string;
}

class OrderService {
    async getAll(params?: { page?: number; pageSize?: number; status?: string }) {
        const response = await apiClient.get<OrderListResponse>(API_ENDPOINTS.ORDERS.LIST, { params });
        return response.data;
    }

    async getById(id: string) {
        const response = await apiClient.get<OrderResponse>(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
        return response.data;
    }

    async create(order: Omit<Order, 'id'>) {
        const response = await apiClient.post<OrderResponse>(API_ENDPOINTS.ORDERS.CREATE, order);
        return response.data;
    }

    async update(id: string, order: Partial<Order>) {
        const response = await apiClient.put<OrderResponse>(API_ENDPOINTS.ORDERS.UPDATE(id), order);
        return response.data;
    }

    async updateStatus(id: string, status: Order['status']) {
        const response = await apiClient.patch<OrderResponse>(
            API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
            { status }
        );
        return response.data;
    }

    async delete(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE(id));
        return response.data;
    }

    async getByUser(userId: string) {
        const response = await apiClient.get<OrderListResponse>(
            API_ENDPOINTS.ORDERS.GET_BY_USER(userId)
        );
        return response.data;
    }
}

export default new OrderService();
