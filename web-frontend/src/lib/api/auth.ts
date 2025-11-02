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

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    return api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (
    email: string
  ): Promise<ApiResponse<void>> => {
    return api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
  },

  /**
   * Forgot password - Send reset password email
   */
  forgotPassword: async (
    email: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    email: string;
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
};
