import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { authService } from '@/src/services/authService';
import { loadTokens, saveTokens, clearTokens, isTokenExpired } from '@/src/services/tokenStorage';
import { UserInfo, LoginRequest, RegisterRequest } from '@/src/types/auth';

type AuthContextValue = {
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ ok: boolean; error?: string; userId?: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Khởi tạo: kiểm tra token khi app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Navigation guard: redirect dựa trên auth state
  useEffect(() => {
    // Đợi navigation sẵn sàng và auth đã check xong
    if (!navigationState?.key || !navigationState?.routes || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Dùng setTimeout để đảm bảo navigation đã mount hoàn toàn
    const timeoutId = setTimeout(() => {
      try {
        if (!isAuthenticated && !inAuthGroup) {
          // Redirect to login if not authenticated and not in auth screens
          router.replace('/login');
        } else if (isAuthenticated && inAuthGroup) {
          // Redirect to main app if authenticated and still in auth screens
          router.replace('/');
        }
      } catch {
        // Bỏ qua lỗi nếu navigation chưa sẵn sàng
        console.log('Navigation not ready yet');
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, segments, router, navigationState?.key, navigationState?.routes, isLoading]);

  /**
   * Kiểm tra trạng thái authentication khi app khởi động
   */
  async function checkAuthStatus() {
    try {
      const tokens = await loadTokens();
      
      if (!tokens) {
        setIsLoading(false);
        return;
      }

      // Kiểm tra access token còn hạn không
      if (!isTokenExpired(tokens.accessTokenExpiresAt)) {
        // Token còn hạn -> load user info
        const userResult = await authService.getCurrentUser();
        if (userResult.ok && userResult.data) {
          setUser(userResult.data);
          setIsAuthenticated(true);
        } else {
          await clearTokens();
        }
      } else if (tokens.refreshToken && !isTokenExpired(tokens.refreshTokenExpiresAt)) {
        // Access token hết hạn nhưng refresh token còn -> refresh
        const refreshResult = await authService.refreshToken({ 
          refreshToken: tokens.refreshToken 
        });
        
        if (refreshResult.ok && refreshResult.data) {
          await saveTokens({
            accessToken: refreshResult.data.accessToken,
            refreshToken: refreshResult.data.refreshToken,
            accessTokenExpiresAt: refreshResult.data.accessTokenExpiresAt,
            refreshTokenExpiresAt: refreshResult.data.refreshTokenExpiresAt,
          });

          const userResult = await authService.getCurrentUser();
          if (userResult.ok && userResult.data) {
            setUser(userResult.data);
            setIsAuthenticated(true);
          }
        } else {
          await clearTokens();
        }
      } else {
        // Cả 2 token đều hết hạn
        await clearTokens();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Đăng nhập
   */
  async function login(credentials: LoginRequest) {
    try {
      const result = await authService.login(credentials);
      
      if (result.ok && result.data) {
        // Lưu tokens
        await saveTokens({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          accessTokenExpiresAt: result.data.accessTokenExpiresAt,
          refreshTokenExpiresAt: result.data.refreshTokenExpiresAt,
        });

        // Set user info
        setUser(result.data.user);
        setIsAuthenticated(true);

        return { ok: true };
      }

      return { ok: false, error: result.error || 'Đăng nhập thất bại' };
    } catch (error) {
      return { ok: false, error: 'Đã xảy ra lỗi khi đăng nhập' };
    }
  }

  /**
   * Đăng ký
   */
  async function register(data: RegisterRequest) {
    try {
      const result = await authService.register(data);
      
      if (result.ok && result.data) {
        return { 
          ok: true, 
          userId: result.data.userId 
        };
      }

      return { ok: false, error: result.error || 'Đăng ký thất bại' };
    } catch (error) {
      return { ok: false, error: 'Đã xảy ra lỗi khi đăng ký' };
    }
  }

  /**
   * Đăng xuất
   */
  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isLoading, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;
