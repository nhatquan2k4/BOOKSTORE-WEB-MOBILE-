// API Configuration
export const API_CONFIG = {
  // BASE_URL: 'http://192.168.1.243:5276/api',
  // IMAGE_BASE_URL: 'http://192.168.1.243:9000',

  BASE_URL: 'https://tautologously-hyperconscious-carolyne.ngrok-free.dev/api',
  IMAGE_BASE_URL: 'https://tautologously-hyperconscious-carolyne.ngrok-free.dev/storage',
  TIMEOUT: 30000, // 30 seconds
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    LOGOUT: '/Auth/logout',
    REFRESH_TOKEN: '/Auth/refresh-token',
  },
};
