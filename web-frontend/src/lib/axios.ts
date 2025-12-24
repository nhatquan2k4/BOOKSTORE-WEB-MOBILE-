import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    console.log('[AXIOS INTERCEPTOR] Token exists:', !!token);
    console.log('[AXIOS INTERCEPTOR] Token value:', token ? `${token.substring(0, 30)}...` : 'null');
    console.log('[AXIOS INTERCEPTOR] Request URL:', config.url);
    console.log('[AXIOS INTERCEPTOR] Request method:', config.method);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[AXIOS INTERCEPTOR] Authorization header set');
    } else {
      console.warn('[AXIOS INTERCEPTOR] ⚠️ NO TOKEN FOUND - Request will fail with 401/403!');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Save new tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Error Response Type
export interface ApiErrorResponse {
  message: string;
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// API Success Response Type
export interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Paged Result Type
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Error Handler
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Handle API Error
export const handleApiError = (error: any): never => {
  console.log('[AXIOS] handleApiError called with:', error);
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.log('[AXIOS] Is AxiosError:', {
      hasResponse: !!axiosError.response,
      hasRequest: !!axiosError.request,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });
    
    if (axiosError.response) {
      // Server responded with error
      const { data, status } = axiosError.response;
      const message = data?.message || data?.error || 'Có lỗi xảy ra từ server';
      
      console.log('[AXIOS] Throwing ApiError:', { message, status, errors: data?.errors });
      throw new ApiError(message, status, data?.errors);
    } else if (axiosError.request) {
      // Request was made but no response
      console.log('[AXIOS] No response from server');
      throw new ApiError('Không thể kết nối đến server', 503);
    }
  }
  
  // Unknown error
  console.log('[AXIOS] Unknown error type');
  throw new ApiError(error.message || 'Có lỗi không xác định xảy ra', 500);
};

export default axiosInstance;
