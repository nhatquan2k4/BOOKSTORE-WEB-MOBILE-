// Auth API
import api from './axios';
import { API_ENDPOINTS } from './endpoints';
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest, User } from '@/types/user';

export const authApi = {
  /**
   * Login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  /**
   * Register
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    return api.post(API_ENDPOINTS.AUTH.REFRESH, data);
  },

  /**
   * Get current user
   */
  me: async (): Promise<User> => {
    return api.get(API_ENDPOINTS.AUTH.ME);
  },
};
