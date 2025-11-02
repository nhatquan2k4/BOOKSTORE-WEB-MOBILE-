// Application Routes
export const ROUTES = {
  HOME: '/',
  
  // Books
  BOOKS: '/books',
  BOOK_DETAIL: (id: string) => `/books/${id}`,
  BOOK_CATEGORY: (slug: string) => `/books/category/${slug}`,
  
  // Authors
  AUTHORS: '/authors',
  AUTHOR_DETAIL: (id: string) => `/authors/${id}`,
  
  // Rental
  RENTAL: '/rental',
  RENTAL_DETAIL: (id: string) => `/rental/${id}`,
  
  // Search
  SEARCH: '/search',
  
  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Account Dashboard
  ACCOUNT: {
    PROFILE: '/account/profile',
    ORDERS: '/account/orders',
    ORDER_DETAIL: (id: string) => `/account/orders/${id}`,
    RENTALS: '/account/rentals',
    RENTAL_DETAIL: (id: string) => `/account/rentals/${id}`,
    ADDRESSES: '/account/addresses',
    WISHLIST: '/account/wishlist',
  },
  
  // Admin (future)
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    BOOKS: '/admin/books',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
  },
} as const;
