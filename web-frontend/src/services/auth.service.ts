import axiosInstance, { handleApiError } from '@/lib/axios';
import {
  LoginDto,
  RegisterDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
  UserInfoDto,
} from '@/types/dtos';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserInfo,
} from '@/types/models/user';

const AUTH_BASE_URL = '/api/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Convert UserInfoDto to UserInfo (for backward compatibility)
function convertUserInfo(dto: UserInfoDto): UserInfo {
  return {
    id: dto.id,
    userName: dto.userName || dto.email.split('@')[0], // Backend returns userName
    email: dto.email,
    isActive: dto.isActive ?? true,
    roles: dto.roles || [],
    permissions: dto.permissions || [],
  };
}

class AuthService {
  constructor() {
    // Clean up invalid data on initialization
    if (typeof window !== 'undefined') {
      this.validateStoredData();
    }
  }

  /**
   * Validate and clean up stored data
   */
  private validateStoredData(): void {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);

    // Clean up if data is invalid
    if (
      token === 'undefined' ||
      token === 'null' ||
      user === 'undefined' ||
      user === 'null'
    ) {
      this.clearSession();
    }
  }

  /**
   * Đăng nhập với business logic
   */
  async login(credentials: LoginRequest): Promise<UserInfo> {
    try {
      // Send with PascalCase to match .NET DTO exactly
      const response = await axiosInstance.post<{ data: LoginResponseDto }>(
        `${AUTH_BASE_URL}/login`,
        {
          Email: credentials.email,
          Password: credentials.password,
          RememberMe: credentials.rememberMe ?? false,
        }
      );

      console.log('Login response:', response);
      console.log('Response data:', response.data);

      // Backend returns: { Success, Message, Data: { AccessToken, RefreshToken, User, ... } }
      const apiResponse = response.data;
      const loginData = apiResponse.Data || apiResponse.data || apiResponse;
      
      if (!loginData || (!loginData.AccessToken && !loginData.accessToken)) {
        throw new Error('Invalid response from server: ' + JSON.stringify(apiResponse));
      }

      console.log('Login data:', loginData);

      // Backend uses PascalCase, normalize to camelCase
      const accessToken = loginData.AccessToken || loginData.accessToken;
      const refreshToken = loginData.RefreshToken || loginData.refreshToken;
      const accessTokenExpiresAt = loginData.AccessTokenExpiresAt || loginData.accessTokenExpiresAt;
      const refreshTokenExpiresAt = loginData.RefreshTokenExpiresAt || loginData.refreshTokenExpiresAt;
      const userDto = loginData.User || loginData.user || loginData.userInfo;

      if (!accessToken || !refreshToken) {
        throw new Error('Missing tokens in response');
      }

      // Save tokens first
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Convert user info
      let userInfo: UserInfo;
      
      if (userDto) {
        // User info included in login response
        userInfo = convertUserInfo(userDto);
      } else {
        // Fetch user info separately (fallback)
        console.log('User info not in login response, fetching from /auth/me');
        const userResponse = await axiosInstance.get<{ Data: UserInfoDto; data: UserInfoDto }>(`${AUTH_BASE_URL}/me`);
        const userData = userResponse.data?.Data || userResponse.data?.data || userResponse.data;
        userInfo = convertUserInfo(userData);
      }

      // Save complete auth data
      const authData: AuthResponse = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
        user: userInfo,
      };

      this.setSession(authData);
      return userInfo;
    } catch (error) {
      console.error('Login error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Đăng ký tài khoản mới với business logic
   */
  async register(data: RegisterRequest): Promise<UserInfo> {
    try {
      // Send with PascalCase to match .NET DTO exactly
      const response = await axiosInstance.post<{ data: LoginResponseDto }>(
        `${AUTH_BASE_URL}/register`,
        {
          Email: data.email,
          Password: data.password,
          ConfirmPassword: data.confirmPassword,
          FullName: data.fullName,
          PhoneNumber: data.phoneNumber,
        }
      );

      console.log('Register response:', response);
      console.log('Response data:', response.data);

      // Backend returns: { Success, Message, Data: { AccessToken, RefreshToken, User, ... } }
      const apiResponse = response.data;
      const loginData = apiResponse.Data || apiResponse.data || apiResponse;
      
      if (!loginData || (!loginData.AccessToken && !loginData.accessToken)) {
        throw new Error('Invalid response from server: ' + JSON.stringify(apiResponse));
      }

      console.log('Register data:', loginData);

      // Backend uses PascalCase, normalize to camelCase
      const accessToken = loginData.AccessToken || loginData.accessToken;
      const refreshToken = loginData.RefreshToken || loginData.refreshToken;
      const accessTokenExpiresAt = loginData.AccessTokenExpiresAt || loginData.accessTokenExpiresAt;
      const refreshTokenExpiresAt = loginData.RefreshTokenExpiresAt || loginData.refreshTokenExpiresAt;
      const userDto = loginData.User || loginData.user || loginData.userInfo;

      if (!accessToken || !refreshToken) {
        throw new Error('Missing tokens in response');
      }

      // Save tokens first
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Convert user info
      let userInfo: UserInfo;
      
      if (userDto) {
        // User info included in register response
        userInfo = convertUserInfo(userDto);
      } else {
        // Fetch user info separately (fallback)
        console.log('User info not in register response, fetching from /auth/me');
        const userResponse = await axiosInstance.get<{ Data: UserInfoDto; data: UserInfoDto }>(`${AUTH_BASE_URL}/me`);
        const userData = userResponse.data?.Data || userResponse.data?.data || userResponse.data;
        userInfo = convertUserInfo(userData);
      }

      // Save complete auth data
      const authData: AuthResponse = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
        user: userInfo,
      };

      this.setSession(authData);
      return userInfo;
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Check if error is about email sending (SMTP issue)
      const errorMessage = error?.response?.data?.message || error?.message || '';
      if (errorMessage.includes('Failed to send email') || errorMessage.includes('SMTP')) {
        // Email sending failed, but registration might have succeeded
        // Try to login with the credentials
        try {
          const loginResult = await this.login({
            email: data.email,
            password: data.password,
            rememberMe: false,
          });
          
          // Login successful - registration was successful, just email failed
          console.log('Registration successful, but email verification failed. User can still login.');
          return loginResult;
        } catch (loginError) {
          // Login also failed - registration actually failed
          return handleApiError(error);
        }
      }
      
      return handleApiError(error);
    }
  }

  /**
   * Làm mới access token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      const response = await axiosInstance.post<{ data: RefreshTokenResponseDto }>(
        `${AUTH_BASE_URL}/refresh-token`,
        dto
      );

      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        this.updateTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Đăng xuất với business logic
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post(`${AUTH_BASE_URL}/logout`);
    } catch (error: unknown) {
      // Ignore 401 errors during logout (token might be expired)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 401) {
          console.error('Logout API error:', error);
        }
      } else {
        console.error('Logout API error:', error);
      }
    } finally {
      // Always clear session regardless of API call result
      this.clearSession();
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(dto: ChangePasswordDto): Promise<ChangePasswordResponseDto> {
    try {
      const response = await axiosInstance.post<{ data: ChangePasswordResponseDto }>(
        `${AUTH_BASE_URL}/change-password`,
        dto
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Quên mật khẩu - Gửi email reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        `${AUTH_BASE_URL}/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Reset mật khẩu với token
   */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(
        `${AUTH_BASE_URL}/reset-password`,
        { token, newPassword, confirmPassword }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Xác thực email với token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post<{ success: boolean; message: string }>(
        `${AUTH_BASE_URL}/verify-email`,
        { token }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Gửi lại email xác thực
   */
  async resendVerificationEmail(email: string) {
    try {
      // 1. URL phải là /api/EmailVerification/resend (Không phải /api/auth/...)
      // 2. Body phải là object { email: ... } để khớp với class ResendVerificationRequest bên C#
      const response = await axiosInstance.post('/api/EmailVerification/resend', {
        email: email
      });

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async checkVerificationStatus(userId: string) {
    try {
      const response = await axiosInstance.get(`/api/EmailVerification/status/${userId}`);
      return response.data; 
      // Mong đợi trả về: { success: true, data: { isVerified: true/false } }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): UserInfo | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr || userStr === 'undefined' || userStr === 'null') return null;

    try {
      return JSON.parse(userStr) as UserInfo;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();

    if (!token || !user) return false;

    // Check if token is expired
    try {
      const tokenData = this.decodeToken(token);
      const currentTime = Date.now() / 1000; // Convert to seconds

      // Token expired
      if (
        tokenData &&
        'exp' in tokenData &&
        typeof tokenData.exp === 'number' &&
        tokenData.exp < currentTime
      ) {
        console.log('Token expired, clearing session...');
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw error;
    }
  }

  /**
   * Set session data
   */
  private setSession(authData: AuthResponse): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Update access token (for refresh token flow)
   */
  updateTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
}

export const authService = new AuthService();
