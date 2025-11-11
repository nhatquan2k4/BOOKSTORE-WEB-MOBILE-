import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { apiLogin, apiRegister, LoginCredentials, RegisterCredentials } from '../api/auth';
import { storeToken, getToken, removeToken } from '../utils/storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component
 * Manages authentication state and provides auth methods
 * Handles automatic navigation based on auth state
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check for existing token on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/');
    }
  }, [user, segments, isLoading, router]);

  /**
   * Load stored authentication token on app start
   */
  const loadStoredAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        // In a real app, validate token with backend or decode JWT
        // For now, we'll create a mock user
        setUser({
          id: '123',
          email: 'stored@user.com',
          name: 'Stored User'
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   * Calls API, stores token, and updates user state
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiLogin(credentials);
      await storeToken(response.token);
      setUser(response.user);
      // Navigation handled by useEffect
    } catch (error) {
      // Re-throw error to be handled by the component
      throw error;
    }
  };

  /**
   * Register function
   * Calls API, stores token, and updates user state
   */
  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await apiRegister(credentials);
      await storeToken(response.token);
      setUser(response.user);
      // Navigation handled by useEffect
    } catch (error) {
      // Re-throw error to be handled by the component
      throw error;
    }
  };

  /**
   * Logout function
   * Clears token and user state, redirects to login
   */
  const logout = async () => {
    try {
      await removeToken();
      setUser(null);
      // Navigation handled by useEffect
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
