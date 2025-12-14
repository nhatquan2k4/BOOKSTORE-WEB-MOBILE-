/**
 * API Configuration
 * Thay đổi BASE_URL tùy theo môi trường
 */

// Development - Local testing
// export const API_BASE_URL = 'http://10.0.2.2:5000'; // Android Emulator
// export const API_BASE_URL = 'http://localhost:5000'; // iOS Simulator
// export const API_BASE_URL = 'http://192.168.1.100:5000'; // Thiết bị thật (thay IP máy bạn)

// Production
export const API_BASE_URL = 'http://192.168.1.252:5276'; // TODO: Thay bằng URL production

// Timeout settings
export const API_TIMEOUT = 15000; // 15 seconds

// Token expiry buffer (refresh trước khi hết hạn)
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes
