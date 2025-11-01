// Auth API
import api from './axios';
import { API_ENDPOINTS } from './endpoints';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserInfo,
  ApiResponse,
} from "@/types/user";

export const authApi = {
  /**
   * Login
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  /**
   * Register
   */
  register: async (
    data: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    return api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * Logout
   */
  logout: async (): Promise<ApiResponse<void>> => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> => {
    return api.post(API_ENDPOINTS.AUTH.REFRESH, data);
  },

  /**
   * Get current user
   */
  me: async (): Promise<ApiResponse<UserInfo>> => {
    return api.get(API_ENDPOINTS.AUTH.ME);
  },
};
