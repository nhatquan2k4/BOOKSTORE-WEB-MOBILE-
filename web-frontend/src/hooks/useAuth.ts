'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services';
import { UserInfo, LoginRequest, RegisterRequest } from '@/types/models/user';

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      loadUser();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setError(null);
      } else {
        authService.clearSession();
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      authService.clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const userInfo = await authService.login(credentials);
      
      // authService.login already saves tokens and user info
      // Just update the state
      setUser(userInfo);
      
      return userInfo;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const userInfo = await authService.register(data);
      
      // authService.register already saves tokens and user info
      // Just update the state
      setUser(userInfo);
      
      return userInfo;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      // authService.logout already clears session
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetchUser: loadUser,
  };
}
