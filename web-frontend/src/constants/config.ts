// Application Configuration
export const APP_CONFIG = {
  APP_NAME: 'BookStore',
  APP_DESCRIPTION: 'Hệ thống bán sách và cho thuê eBook',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
  
  // Cart
  MAX_CART_ITEMS: 99,
  MAX_QUANTITY_PER_ITEM: 10,
  
  // Rental
  RENTAL_PERIODS: [
    { id: '1m', name: '1 tháng', months: 1, price: 10000 },
    { id: '3m', name: '3 tháng', months: 3, price: 25000, discountPercent: 15 },
    { id: '6m', name: '6 tháng', months: 6, price: 45000, discountPercent: 25 },
    { id: '1y', name: '1 năm', months: 12, price: 80000, discountPercent: 35 },
  ],
  
  // Order Status
  ORDER_STATUS: {
    PENDING_PAYMENT: 'PendingPayment',
    PAID: 'Paid',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  },
  
  // Payment
  PAYMENT_TIMEOUT_MINUTES: 15,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
} as const;
