/**
 * Google Maps Configuration
 * 
 * Để sử dụng Google Maps API (nếu cần):
 * 1. Tạo API key tại: https://console.cloud.google.com/
 * 2. Enable Maps SDK for Android và Maps SDK for iOS
 * 3. Thêm API key vào app.json:
 * 
 * "android": {
 *   "config": {
 *     "googleMaps": {
 *       "apiKey": "YOUR_ANDROID_API_KEY"
 *     }
 *   }
 * }
 * 
 * "ios": {
 *   "config": {
 *     "googleMapsApiKey": "YOUR_IOS_API_KEY"
 *   }
 * }
 */

// Hiện tại đang dùng OpenStreetMap (Nominatim) - FREE, không cần API key
// Nếu cần độ chính xác cao hơn hoặc nhiều request hơn, hãy chuyển sang Google Maps Geocoding API

export const GOOGLE_MAPS_API_KEY = ''; // Để trống nếu dùng OSM

export const MAP_CONFIG = {
  // Vietnam default center (Hanoi)
  defaultLatitude: 21.0285,
  defaultLongitude: 105.8542,
  defaultZoom: 15,
  
  // Map style (optional)
  mapStyle: [
    // Có thể thêm custom map style từ: https://mapstyle.withgoogle.com/
  ],
};
