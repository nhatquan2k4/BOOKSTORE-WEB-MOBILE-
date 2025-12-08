import apiClient from '../utils/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phoneNumber?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            roles: string[];
        };
    };
}

class AuthService {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

        if (response.data.success && response.data.data) {
            // Lưu tokens và user info vào localStorage
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.data.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
        }

        return response.data;
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa tokens và user info
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
        return response.data.data;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
}

export default new AuthService();