'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/services/auth.service';
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user';

interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const authenticated = authService.isAuthenticated();
        
        if (authenticated && currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Listen for automatic logout events (from axios interceptor)
  useEffect(() => {
    const handleAutoLogout = (event: CustomEvent) => {
      const reason = event.detail?.reason;
      console.log('Auto logout triggered:', reason);
      
      // Clear user state
      setUser(null);
      setIsLoading(false);
      
      // Show notification to user
      if (reason === 'token_expired') {
        // Store message in sessionStorage to show on login page
        sessionStorage.setItem('logoutReason', 'expired');
      }
    };

    window.addEventListener('auth:logout', handleAutoLogout as EventListener);
    
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout as EventListener);
    };
  }, []);

  // Periodically check token validity
  useEffect(() => {
    if (!user) return;

    const checkTokenValidity = () => {
      const authenticated = authService.isAuthenticated();
      if (!authenticated && user) {
        console.log('Token expired, logging out...');
        logout();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(data);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
