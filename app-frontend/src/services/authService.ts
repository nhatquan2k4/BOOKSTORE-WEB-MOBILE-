import axios, { AxiosInstance, AxiosError } from 'axios';
// Use centralized token storage (SecureStore) to keep storage consistent with AuthProvider
import { saveTokens, loadTokens, clearTokens } from '@/src/services/tokenStorage';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ChangePasswordRequest,
  ApiResponse,
  ServiceResult,
  UserInfo,
} from '@/src/types/auth';
import { API_BASE_URL, API_TIMEOUT } from '@/src/config/api';

// Token storage helpers are imported from tokenStorage.ts (SecureStore)

class AuthService {
  private api: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    // Request interceptor: tự động thêm access token vào header
    this.api.interceptors.request.use(
      async (config) => {
        const tokens = await loadTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: xử lý 401 và tự động refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Thử refresh token
            const newAccessToken = await this.handleRefreshToken();
            
            if (newAccessToken && originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh thất bại -> logout
            await clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Xử lý refresh token (tránh race condition bằng cách cache promise)
   */
  private async handleRefreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const tokens = await loadTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        const result = await this.refreshToken({ refreshToken: tokens.refreshToken });

        if (result.ok && result.data) {
          // Save full token payload using centralized saveTokens
          await saveTokens({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            accessTokenExpiresAt: result.data.accessTokenExpiresAt,
            refreshTokenExpiresAt: result.data.refreshTokenExpiresAt,
          });
          return result.data.accessToken;
        }

        throw new Error('Refresh failed');
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Đăng nhập
   */
  async login(data: LoginRequest): Promise<ServiceResult<LoginResponse>> {
    try {
      const response = await this.api.post<ApiResponse<LoginResponse>>(
        '/api/Auth/login',
        data
      );

      if (response.data.success && response.data.data) {
        await saveTokens({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          accessTokenExpiresAt: response.data.data.accessTokenExpiresAt,
          refreshTokenExpiresAt: response.data.data.refreshTokenExpiresAt,
        });
        return {
          ok: true,
          data: response.data.data,
          message: response.data.message,
        };
      }

      return {
        ok: false,
        error: response.data.message || 'Đăng nhập thất bại',
      };
    } catch (error) {
      return this.handleError(error, 'Email hoặc mật khẩu không đúng');
    }
  }

  /**
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterRequest): Promise<ServiceResult<RegisterResponse>> {
    try {
      const response = await this.api.post<ApiResponse<RegisterResponse>>(
        '/api/Auth/register',
        data
      );

      if (response.data.success && response.data.data) {
        return {
          ok: true,
          data: response.data.data,
          message: response.data.message,
        };
      }

      return {
        ok: false,
        error: response.data.message || 'Đăng ký thất bại',
      };
    } catch (error) {
      return this.handleError(error, 'Đăng ký thất bại');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<ServiceResult<RefreshTokenResponse>> {
    try {
      const response = await this.api.post<ApiResponse<RefreshTokenResponse>>(
        '/api/Auth/refresh-token',
        data
      );

      if (response.data.success && response.data.data) {
        return {
          ok: true,
          data: response.data.data,
        };
      }

      return {
        ok: false,
        error: 'Làm mới token thất bại',
      };
    } catch (error) {
      return this.handleError(error, 'Làm mới token thất bại');
    }
  }

  /**
   * Quên mật khẩu - gửi email reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ServiceResult> {
    try {
      const response = await this.api.post<ApiResponse>(
        '/api/Auth/forgot-password',
        data
      );

      return {
        ok: response.data.success,
        message: response.data.message || 'Email đặt lại mật khẩu đã được gửi',
      };
    } catch (error) {
      return this.handleError(error, 'Không thể gửi email đặt lại mật khẩu');
    }
  }

  /**
   * Reset mật khẩu với token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ServiceResult> {
    try {
      const response = await this.api.post<ApiResponse>(
        '/api/Auth/reset-password',
        data
      );

      return {
        ok: response.data.success,
        message: response.data.message || 'Đặt lại mật khẩu thành công',
      };
    } catch (error) {
      return this.handleError(error, 'Không thể đặt lại mật khẩu');
    }
  }

  /**
   * Đổi mật khẩu (yêu cầu đăng nhập)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ServiceResult> {
    try {
      // Backend expects: CurrentPassword, NewPassword, ConfirmNewPassword
      const backendPayload = {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      };

      console.log('🔐 Changing password...');
      const response = await this.api.post<{ success: boolean; message: string; data?: any }>(
        '/api/Auth/change-password',
        backendPayload
      );

      console.log('✅ Change password response:', response.data);

      // Backend trả về { Success: true, Message: "...", Data: {...} }
      const responseData = response.data as any;
      return {
        ok: responseData.success || responseData.Success || false,
        message: responseData.message || responseData.Message || 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      // Không log raw error, để handleError xử lý
      return this.handleError(error, 'Không thể đổi mật khẩu');
    }
  }

  /**
   * Xác thực email với token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ServiceResult> {
    try {
      const response = await this.api.post<ApiResponse>(
        '/api/EmailVerification/verify',
        data
      );

      return {
        ok: response.data.success,
        message: response.data.message || 'Xác thực email thành công',
      };
    } catch (error) {
      return this.handleError(error, 'Mã xác thực không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Gửi lại email xác thực
   */
  async resendVerificationEmail(data: ResendVerificationRequest): Promise<ServiceResult> {
    try {
      const response = await this.api.post<ApiResponse>(
        '/api/EmailVerification/resend',
        data
      );

      return {
        ok: response.data.success,
        message: response.data.message || 'Email xác thực đã được gửi lại',
      };
    } catch (error) {
      return this.handleError(error, 'Không thể gửi lại email xác thực');
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<ServiceResult<UserInfo>> {
    try {
      const response = await this.api.get<ApiResponse<UserInfo>>('/api/Auth/me');

      if (response.data.success && response.data.data) {
        return {
          ok: true,
          data: response.data.data,
        };
      }

      return {
        ok: false,
        error: 'Không thể lấy thông tin người dùng',
      };
    } catch (error) {
      return this.handleError(error, 'Không thể lấy thông tin người dùng');
    }
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<ServiceResult> {
    try {
      await this.api.post('/api/Auth/logout');
      await clearTokens();
      return {
        ok: true,
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
      // Vẫn clear tokens local kể cả khi API call fail
      await clearTokens();
      return {
        ok: true,
        message: 'Đăng xuất thành công',
      };
    }
  }

  /**
   * Xử lý lỗi chung
   */
  private handleError(error: unknown, defaultMessage: string): ServiceResult {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      // Lỗi từ server
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        
        // Try multiple possible error message fields (case-insensitive)
        const errorMessage = 
          errorData.message || 
          errorData.Message || 
          errorData.error || 
          errorData.Error ||
          defaultMessage;
        
        console.log('📛 Error from server:', {
          status: axiosError.response.status,
          message: errorMessage,
          fullData: errorData
        });

        return {
          ok: false,
          error: errorMessage,
          message: errorMessage,
        };
      }

      // Lỗi network
      if (axiosError.code === 'ECONNABORTED') {
        return {
          ok: false,
          error: 'Yêu cầu hết thời gian chờ',
        };
      }

      if (axiosError.message === 'Network Error') {
        return {
          ok: false,
          error: 'Không có kết nối mạng',
        };
      }
    }

    return {
      ok: false,
      error: defaultMessage,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
