// API Endpoints Configuration
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/Auth/login',
        REGISTER: '/Auth/register',
        LOGOUT: '/Auth/logout',
        REFRESH_TOKEN: '/Auth/refresh-token',
        FORGOT_PASSWORD: '/Auth/forgot-password',
        RESET_PASSWORD: '/Auth/reset-password',
        VERIFY_EMAIL: '/Auth/verify-email',
    },

    // Books Management
    BOOK: {
        LIST: '/Book',
        GET_BY_ID: (id: string) => `/Book/${id}`,
        CREATE: '/Book',
        UPDATE: (id: string) => `/Book/${id}`,
        DELETE: (id: string) => `/Book/${id}`,
        SEARCH: '/Book/search',
        GET_BY_CATEGORY: (categoryId: string) => `/Book?categoryId=${categoryId}`,
        GET_BY_AUTHOR: (authorId: string) => `/Book?authorId=${authorId}`,
        GET_BY_PUBLISHER: (publisherId: string) => `/Book?publisherId=${publisherId}`,
    },

    // Categories Management
    CATEGORY: {
        LIST: '/Category',
        GET_BY_ID: (id: string) => `/Category/${id}`,
        CREATE: '/Category',
        UPDATE: (id: string) => `/Category/${id}`,
        DELETE: (id: string) => `/Category/${id}`,
    },

    // Authors Management
    AUTHOR: {
        LIST: '/Author',
        GET_BY_ID: (id: string) => `/Author/${id}`,
        CREATE: '/Author',
        UPDATE: (id: string) => `/Author/${id}`,
        DELETE: (id: string) => `/Author/${id}`,
    },

    // Publishers Management
    PUBLISHER: {
        LIST: '/Publisher',
        GET_BY_ID: (id: string) => `/Publisher/${id}`,
        CREATE: '/Publisher',
        UPDATE: (id: string) => `/Publisher/${id}`,
        DELETE: (id: string) => `/Publisher/${id}`,
    },

    // Users Management
    USERS: {
        LIST: '/Users',
        GET_BY_ID: (id: string) => `/Users/${id}`,
        CREATE: '/Users',
        UPDATE: (id: string) => `/Users/${id}`,
        DELETE: (id: string) => `/Users/${id}`,
    },

    // User Profile
    USER_PROFILE: {
        GET: '/UserProfile',
        UPDATE: '/UserProfile',
    },

    // Roles Management
    ROLES: {
        LIST: '/Roles',
        GET_BY_ID: (id: string) => `/Roles/${id}`,
        CREATE: '/Roles',
        UPDATE: (id: string) => `/Roles/${id}`,
        DELETE: (id: string) => `/Roles/${id}`,
        ASSIGN_PERMISSIONS: (id: string) => `/Roles/${id}/permissions`,
    },

    // Orders Management
    ORDERS: {
        LIST: '/Orders',
        GET_BY_ID: (id: string) => `/Orders/${id}`,
        CREATE: '/Orders',
        UPDATE: (id: string) => `/Orders/${id}`,
        DELETE: (id: string) => `/Orders/${id}`,
        UPDATE_STATUS: (id: string) => `/Orders/${id}/status`,
        GET_BY_USER: (userId: string) => `/Orders/user/${userId}`,
    },

    // Reviews Management
    REVIEWS: {
        GET_BY_BOOK: (bookId: string) => `/books/${bookId}/reviews`,
        CREATE: (bookId: string) => `/books/${bookId}/reviews`,
        UPDATE: (bookId: string, reviewId: string) => `/books/${bookId}/reviews/${reviewId}`,
        DELETE: (bookId: string, reviewId: string) => `/books/${bookId}/reviews/${reviewId}`,
    },

    // Admin Reviews Management
    ADMIN_REVIEWS: {
        LIST: '/AdminReviews',
        APPROVE: (id: string) => `/AdminReviews/${id}/approve`,
        REJECT: (id: string) => `/AdminReviews/${id}/reject`,
    },

    // Book Comments Management
    BOOK_COMMENTS: {
        GET_BY_BOOK: (bookId: string) => `/books/${bookId}/comments`,
        CREATE: (bookId: string) => `/books/${bookId}/comments`,
        UPDATE: (bookId: string, commentId: string) => `/books/${bookId}/comments/${commentId}`,
        DELETE: (bookId: string, commentId: string) => `/books/${bookId}/comments/${commentId}`,
    },

    // Cart Management
    CART: {
        GET: '/Cart',
        ADD_ITEM: '/Cart/items',
        UPDATE_ITEM: (itemId: string) => `/Cart/items/${itemId}`,
        REMOVE_ITEM: (itemId: string) => `/Cart/items/${itemId}`,
        CLEAR: '/Cart/clear',
    },

    // Checkout
    CHECKOUT: {
        PROCESS: '/Checkout',
        VALIDATE: '/Checkout/validate',
    },

    // Payment
    PAYMENT: {
        PROCESS: '/Payment',
        VERIFY: '/Payment/verify',
        REFUND: (id: string) => `/Payment/${id}/refund`,
    },

    // Prices Management
    PRICES: {
        GET_BY_BOOK: (bookId: string) => `/Prices/book/${bookId}`,
        CREATE: '/Prices',
        UPDATE: (id: string) => `/Prices/${id}`,
        DELETE: (id: string) => `/Prices/${id}`,
    },

    // Stock Management
    STOCK_ITEMS: {
        LIST: '/StockItems',
        GET_BY_ID: (id: string) => `/StockItems/${id}`,
        UPDATE: (id: string) => `/StockItems/${id}`,
    },

    // Inventory Transactions
    INVENTORY_TRANSACTIONS: {
        LIST: '/InventoryTransactions',
        GET_BY_ID: (id: string) => `/InventoryTransactions/${id}`,
        CREATE: '/InventoryTransactions',
    },

    // Warehouses
    WAREHOUSES: {
        LIST: '/Warehouses',
        GET_BY_ID: (id: string) => `/Warehouses/${id}`,
        CREATE: '/Warehouses',
        UPDATE: (id: string) => `/Warehouses/${id}`,
        DELETE: (id: string) => `/Warehouses/${id}`,
    },

    // Shipping
    SHIPPERS: {
        LIST: '/Shippers',
        GET_BY_ID: (id: string) => `/Shippers/${id}`,
        CREATE: '/Shippers',
        UPDATE: (id: string) => `/Shippers/${id}`,
        DELETE: (id: string) => `/Shippers/${id}`,
    },

    SHIPMENTS: {
        LIST: '/Shipments',
        GET_BY_ID: (id: string) => `/Shipments/${id}`,
        CREATE: '/Shipments',
        UPDATE: (id: string) => `/Shipments/${id}`,
        UPDATE_STATUS: (id: string) => `/Shipments/${id}/status`,
    },

    // Rental (E-books)
    RENTAL_PLANS: {
        LIST: '/rental/plans',
        GET_BY_ID: (id: string) => `/rental/plans/${id}`,
        CREATE: '/rental/plans',
        UPDATE: (id: string) => `/rental/plans/${id}`,
        DELETE: (id: string) => `/rental/plans/${id}`,
    },

    EBOOKS: {
        LIST: '/rental/books',
        GET_BY_ID: (id: string) => `/rental/books/${id}`,
        RENT: '/rental/books/rent',
    },

    SUBSCRIPTIONS: {
        LIST: '/rental/subscriptions',
        GET_BY_ID: (id: string) => `/rental/subscriptions/${id}`,
        CREATE: '/rental/subscriptions',
        CANCEL: (id: string) => `/rental/subscriptions/${id}/cancel`,
    },

    // File Upload
    FILES: {
        UPLOAD: '/Files/upload',
        DELETE: (fileId: string) => `/Files/${fileId}`,
    },

    // Book Images
    BOOK_IMAGES: {
        GET_BY_BOOK: (bookId: string) => `/books/${bookId}/images`,
        UPLOAD: (bookId: string) => `/books/${bookId}/images`,
        DELETE: (bookId: string, imageId: string) => `/books/${bookId}/images/${imageId}`,
        SET_PRIMARY: (bookId: string, imageId: string) => `/books/${bookId}/images/${imageId}/primary`,
    },

    // Admin Notification Templates
    NOTIFICATION_TEMPLATES: {
        LIST: '/AdminNotificationTemplates',
        GET_BY_ID: (id: string) => `/AdminNotificationTemplates/${id}`,
        CREATE: '/AdminNotificationTemplates',
        UPDATE: (id: string) => `/AdminNotificationTemplates/${id}`,
        DELETE: (id: string) => `/AdminNotificationTemplates/${id}`,
    },
};

export default API_ENDPOINTS;
