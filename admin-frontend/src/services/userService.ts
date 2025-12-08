import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { User } from '../types';

interface UserListResponse {
    success: boolean;
    data: User[];
    total: number;
    page: number;
    pageSize: number;
}

interface UserResponse {
    success: boolean;
    data: User;
    message: string;
}

class UserService {
    async getAll(params?: { page?: number; pageSize?: number; role?: string; status?: string }) {
        const response = await apiClient.get<UserListResponse>(API_ENDPOINTS.USERS.LIST, { params });
        return response.data;
    }

    async getById(id: string) {
        const response = await apiClient.get<UserResponse>(API_ENDPOINTS.USERS.GET_BY_ID(id));
        return response.data;
    }

    async create(user: Omit<User, 'id'>) {
        const response = await apiClient.post<UserResponse>(API_ENDPOINTS.USERS.CREATE, user);
        return response.data;
    }

    async update(id: string, user: Partial<User>) {
        const response = await apiClient.put<UserResponse>(API_ENDPOINTS.USERS.UPDATE(id), user);
        return response.data;
    }

    async delete(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
        return response.data;
    }

    // async getProfile() {
    //     const response = await apiClient.get<UserResponse>(API_ENDPOINTS.USERS.GET_PROFILE);
    //     return response.data;
    // }

    // async updateProfile(data: Partial<User>) {
    //     const response = await apiClient.put<UserResponse>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    //     return response.data;
    // }
}

export default new UserService();
