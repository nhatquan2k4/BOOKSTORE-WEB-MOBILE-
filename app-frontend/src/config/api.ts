/**
 * API Configuration
 * Thay đổi BASE_URL tùy theo môi trường
 */

// Development - Local testing
// export const API_BASE_URL = 'http://10.0.2.2:5276/api'; // Android Emulator
// export const API_BASE_URL = 'http://localhost:5276/api'; // iOS Simulator
// export const API_BASE_URL = 'http://192.168.1.100:5276/api'; // Thiết bị thật (thay IP máy bạn)

// ====== LOCAL NETWORK ======
// Thay IP này bằng IP máy tính của bạn (chạy `ipconfig` để xem)
// Máy tính và điện thoại phải cùng WiFi
export const API_BASE_URL = "http://192.168.0.102:5276"; // API backend
export const MINIO_BASE_URL = "http://192.168.0.102:9000"; // MinIO storage

// ====== NGROK / TUNNEL (Dùng khi không cùng mạng) ======
// Cách dùng: npm install -g @expo/ngrok
// Expo sẽ tự động tạo tunnel khi chạy `npx expo start --tunnel`
// Hoặc dùng ngrok thủ công:
// export const API_BASE_URL = 'https://your-api.ngrok.io'; // Ngrok API URL (port 5276)
// export const MINIO_BASE_URL = 'https://your-minio.ngrok.io'; // Ngrok MinIO URL (port 9000)
// Lưu ý: Cần chạy 2 ngrok instances:
//   Terminal 1: ngrok http 5276
//   Terminal 2: ngrok http 9000

// Timeout settings
export const API_TIMEOUT = 30000; // 30 seconds

// Token expiry buffer (refresh trước khi hết hạn)
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes

// API Endpoints
export const API_ENDPOINTS = {
  // Books
  BOOKS: {
    LIST: '/api/Book',
    GET_BY_ID: (id: string) => `/api/Book/${id}`,
    SEARCH: '/api/Book/search',
    BY_CATEGORY: (categoryId: string) => `/api/Book/category/${categoryId}`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/api/Category',
    GET_BY_ID: (id: string) => `/api/Category/${id}`,
  },
  
  // Book Images
  BOOK_IMAGES: {
    BY_BOOK: (bookId: string) => `/api/books/${bookId}/images`,
    COVER: (bookId: string) => `/api/books/${bookId}/images/cover`,
  },
  
  // Auth
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    REFRESH: '/api/Auth/refresh-token',
  },
};
