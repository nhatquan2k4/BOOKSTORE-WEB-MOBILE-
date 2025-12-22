// API Client with Axios
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
// Use centralized token storage (SecureStore) to match AuthService
import { getValidAccessToken } from '@/src/services/tokenStorage';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào headers nếu có
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get a valid access token from centralized secure storage
      const token = await getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} ✅ Token attached`);
      } else {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} ⚠️ No token`);
      }
    } catch (error) {
      console.error('[Token Error]', error);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response và errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    return response.data;
  },
  async (error: AxiosError) => {
    console.error('[API Response Error]', error.response?.status, error.message);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - need to login
          console.log('Unauthorized - API requires authentication');
          console.log('URL:', error.config?.url);
          // TODO: Handle logout and redirect
          break;
        case 403:
          console.log('Forbidden - no permission');
          break;
        case 404:
          console.log('Not found');
          break;
        case 500:
          console.log('Internal server error');
          break;
        default:
          console.log('Error:', data);
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('Network error - no response received');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    apiClient.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    apiClient.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    apiClient.put(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    apiClient.delete(url, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    apiClient.patch(url, data, config),
};

export default apiClient;
