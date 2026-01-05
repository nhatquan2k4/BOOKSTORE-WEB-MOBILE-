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

export const API_BASE_URL = "http://192.168.1.243:5276"; // API backend (IP máy tính của bạn)
export const MINIO_BASE_URL = "http://192.168.1.243:9000"; // MinIO storage

//====== NGROK (nếu cần) ======
// export const API_BASE_URL = "https://tautologously-hyperconscious-carolyne.ngrok-free.dev"; 
// export const MINIO_BASE_URL = "https://tautologously-hyperconscious-carolyne.ngrok-free.dev/storage";

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
    SEARCH: '/api/Category/search',
  },
  
  // Authors
  AUTHORS: {
    LIST: '/api/Author',
    GET_BY_ID: (id: string) => `/api/Author/${id}`,
    SEARCH: '/api/Author/search',
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
  
  // Cart
  CART: {
    GET: '/api/Cart',
    ADD: '/api/Cart/add',
    UPDATE_QUANTITY: '/api/Cart/update-quantity',
    REMOVE: '/api/Cart/remove',
    CLEAR: '/api/Cart/clear',
    COUNT: '/api/Cart/count',
    TOTAL: '/api/Cart/total',
  },
  
  // User Profile
  USER_PROFILE: {
    GET: '/api/UserProfile/profile',
    UPDATE: '/api/UserProfile/profile',
    UPLOAD_AVATAR: '/api/UserProfile/profile/avatar',
    DELETE_AVATAR: '/api/UserProfile/profile/avatar',
    ADDRESSES: '/api/UserProfile/addresses',
    ADDRESS_BY_ID: (id: string) => `/api/UserProfile/addresses/${id}`,
    DEFAULT_ADDRESS: '/api/UserProfile/addresses/default',
    SET_DEFAULT_ADDRESS: (id: string) => `/api/UserProfile/addresses/${id}/set-default`,
  },
  
  // Orders
  ORDERS: {
    MY_ORDERS: '/api/orders/my-orders',
    GET_BY_ID: (id: string) => `/api/orders/${id}`,
    GET_BY_ORDER_NUMBER: (orderNumber: string) => `/api/orders/order-number/${orderNumber}`,
    STATUS_HISTORY: (id: string) => `/api/orders/${id}/status-history`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
    CREATE_RENTAL: '/api/orders/rental',
  },
  
  // Checkout
  CHECKOUT: {
    PROCESS: '/api/Checkout/process',
    PAYMENT_CALLBACK: '/api/Checkout/payment-callback',
    PAYMENT_STATUS: (orderId: string) => `/api/Checkout/payment-status/${orderId}`,
    PREVIEW: '/api/Checkout/preview',
  },
  
  // Prices
  PRICES: {
    BY_BOOK_ID: (bookId: string) => `/api/Prices/book/${bookId}`,
  },
  
  // Stock
  STOCK: {
    BY_BOOK_ID: (bookId: string) => `/api/StockItems/book/${bookId}`,
    CHECK_AVAILABILITY: '/api/StockItems/check-availability',
  },
  
  // Wishlist
  WISHLIST: {
    GET: '/api/Wishlist',
    COUNT: '/api/Wishlist/count',
    SUMMARY: '/api/Wishlist/summary',
    CHECK_EXISTS: '/api/Wishlist',
    ADD: '/api/Wishlist',
    REMOVE: '/api/Wishlist',
    CLEAR: '/api/Wishlist/clear',
  },
  
  // ChatBot
  CHATBOT: {
    ASK: '/api/ChatBot/ask',
    CACHE_REFRESH: '/api/ChatBot/cache/refresh',
    CACHE_STATUS: '/api/ChatBot/cache/status',
  },
  
  // Email Verification
  EMAIL_VERIFICATION: {
    VERIFY: '/api/EmailVerification/verify',
    RESEND: '/api/EmailVerification/resend',
  },
  
  // Notifications
  NOTIFICATIONS: {
    MY: '/api/notifications/my',
    RECENT: '/api/notifications/recent',
    GET_BY_ID: (id: string) => `/api/notifications/${id}`,
    MARK_AS_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/api/notifications/read-all',
    UNREAD_COUNT: '/api/notifications/unread-count',
    DELETE: (id: string) => `/api/notifications/${id}`,
    DELETE_ALL: '/api/notifications/delete-all',
    CREATE_TEST: '/api/notifications/test',
  },
};
