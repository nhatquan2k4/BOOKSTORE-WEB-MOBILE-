// Auth Service - Centralized authentication logic
import { authApi } from "@/lib/api/auth";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserInfo,
} from "@/types/user";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

class AuthService {
  constructor() {
    // Clean up invalid data on initialization
    if (typeof window !== "undefined") {
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
      token === "undefined" ||
      token === "null" ||
      user === "undefined" ||
      user === "null"
    ) {
      this.clearSession();
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<UserInfo> {
    const response = await authApi.login(credentials);

    if (!response.success || !response.data) {
      throw new Error(response.message || "Đăng nhập thất bại");
    }

    this.setSession(response.data);
    return response.data.user;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<UserInfo> {
    const response = await authApi.register(data);

    if (!response.success || !response.data) {
      throw new Error(response.message || "Đăng ký thất bại");
    }

    this.setSession(response.data);
    return response.data.user;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): UserInfo | null {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr || userStr === "undefined" || userStr === "null") return null;

    try {
      return JSON.parse(userStr) as UserInfo;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      // Clear invalid data
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  /**
   * Set session data
   */
  private setSession(authData: AuthResponse): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Update access token (for refresh token flow)
   */
  updateTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
}

export const authService = new AuthService();
