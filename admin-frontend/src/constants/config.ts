// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://192.168.0.102/api',
    MINIO_BASE_URL: import.meta.env.VITE_MINIO_BASE_URL || 'http://localhost:9000',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};

// Helper function to get full image URL from relative path
export const getImageUrl = (relativePath: string | undefined | null): string => {
    if (!relativePath) return '';
    
    // If already a full URL, return as-is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    
    // Remove leading slash if exists
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    
    // Combine MinIO base URL with relative path
    return `${API_CONFIG.MINIO_BASE_URL}/${cleanPath}`;
};

// Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Response Status
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export default API_CONFIG;
