// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    LOGOUT: "/Auth/logout",
    REFRESH: "/Auth/refresh-token",
    ME: "/Auth/me",
  },

  // Books
  BOOKS: {
    BASE: "/books",
    BY_ID: (id: string) => `/books/${id}`,
    SEARCH: "/books/search",
    BY_CATEGORY: (categoryId: string) => `/books/category/${categoryId}`,
    BY_AUTHOR: (authorId: string) => `/books/author/${authorId}`,
  },

  // Authors
  AUTHORS: {
    BASE: "/authors",
    BY_ID: (id: string) => `/authors/${id}`,
    SEARCH: "/authors/search",
  },

  // Categories
  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id: string) => `/categories/${id}`,
  },

  // Publishers
  PUBLISHERS: {
    BASE: "/publishers",
    BY_ID: (id: string) => `/publishers/${id}`,
  },

  // Cart
  CART: {
    BASE: "/cart",
    BY_USER: (userId: string) => `/cart/${userId}`,
    ADD_ITEM: "/cart/items",
    UPDATE_ITEM: (id: string) => `/cart/items/${id}`,
    REMOVE_ITEM: (id: string) => `/cart/items/${id}`,
    CLEAR: (userId: string) => `/cart/${userId}/clear`,
  },

  // Orders
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${id}`,
    BY_USER: (userId: string) => `/orders/user/${userId}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  // Payments
  PAYMENTS: {
    WEBHOOK: "/payments/webhook",
    BY_ORDER: (orderId: string) => `/payments/order/${orderId}`,
  },

  // Rentals
  RENTALS: {
    BASE: "/rentals",
    BY_ID: (id: string) => `/rentals/${id}`,
    BY_USER: (userId: string) => `/rentals/user/${userId}`,
    RETURN: (id: string) => `/rentals/${id}/return`,
  },

  // User Profile
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: "/users/profile",
    ADDRESSES: "/users/addresses",
    ADDRESS_BY_ID: (id: string) => `/users/addresses/${id}`,
  },
} as const;
