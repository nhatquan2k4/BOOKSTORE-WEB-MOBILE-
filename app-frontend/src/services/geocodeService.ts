import axios from 'axios';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Làm sạch địa chỉ Việt Nam cho Nominatim
 * Bỏ các tiền tố không cần thiết và chuẩn hóa
 */
const cleanVietnameseAddress = (text: string): string => {
  return text
    .toLowerCase() // Chuyển thường để dễ xử lý
    .replace(/^số\s+/gi, '') // Bỏ "số" ở đầu
    .replace(/^ngõ\s+/gi, '') // Bỏ "ngõ" ở đầu  
    .replace(/^ngách\s+/gi, '') // Bỏ "ngách" ở đầu
    .replace(/phường\s+/gi, '') // Bỏ "Phường"
    .replace(/phường\s*/gi, '') // Bỏ "phường" không dấu cách
    .replace(/quận\s+/gi, '') // Bỏ "Quận"
    .replace(/quận\s*/gi, '') // Bỏ "quận" không dấu cách
    .replace(/huyện\s+/gi, '') // Bỏ "Huyện"
    .replace(/xã\s+/gi, '') // Bỏ "Xã"
    .replace(/thành phố\s+/gi, '') // Bỏ "Thành phố"
    .replace(/thành phố\s*/gi, '') // Bỏ "thành phố" không dấu cách
    .replace(/tp\.\s*/gi, '') // Bỏ "TP."
    .replace(/tp\s+/gi, '') // Bỏ "TP"
    .replace(/đường\s+/gi, '') // Bỏ "đường"
    .replace(/phố\s+/gi, '') // Bỏ "phố"
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

/**
 * Trích xuất tên đường chính từ địa chỉ
 * VD: "số 3 ngõ 318 La Thành" → "La Thành"
 */
const extractMainStreet = (streetAddress: string): string => {
  // Tìm tên đường sau ngõ/ngách/số
  const match = streetAddress.match(/(?:ngõ|ngách|số)\s*\d+\s+(.+)/i);
  if (match) {
    return match[1].trim();
  }
  return streetAddress;
};

/**
 * Geocode địa chỉ Việt Nam sử dụng Nominatim (OpenStreetMap)
 * Free, không cần API key
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    console.log('📍 Geocoding:', address);
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 5, // Tăng từ 1 lên 5 để có nhiều lựa chọn
        addressdetails: 1,
        countrycodes: 'vn', // Chỉ tìm ở Việt Nam
      },
      headers: {
        'User-Agent': 'BookstoreApp/1.0', // Nominatim yêu cầu User-Agent
      },
    });

    if (response.data && response.data.length > 0) {
      // Lọc kết quả: Ưu tiên road/residential/house hơn là amenity/building
      const results = response.data;
      
      // Tìm kết quả có type phù hợp với địa chỉ dân cư
      const preferredResult = results.find((r: any) => 
        r.type === 'road' || 
        r.type === 'residential' || 
        r.type === 'house' ||
        r.type === 'suburb' ||
        r.class === 'highway' ||
        r.class === 'place'
      );
      
      // Dùng kết quả ưu tiên, hoặc kết quả đầu tiên nếu không có
      const result = preferredResult || results[0];
      
      const coords = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
      
      console.log('✅ Found:', coords);
      console.log('   Type:', result.type, '| Class:', result.class);
      console.log('   Display:', result.display_name);
      
      return coords;
    }

    console.log('❌ Not found');
    return null;
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return null;
  }
};

/**
 * Geocode địa chỉ đầy đủ từ các trường riêng biệt với fallback strategy
 * Thử nhiều cấp độ chi tiết và nhiều format khác nhau
 */
export const geocodeFullAddress = async (
  streetAddress: string,
  ward: string,
  district: string,
  province: string
): Promise<Coordinates | null> => {
  // Clean các trường
  const cleanStreet = cleanVietnameseAddress(streetAddress);
  const cleanWard = cleanVietnameseAddress(ward);
  const cleanDistrict = cleanVietnameseAddress(district);
  const cleanProvince = cleanVietnameseAddress(province);
  
  // Trích xuất tên đường chính (bỏ số nhà, ngõ, ngách)
  const mainStreet = extractMainStreet(streetAddress);
  const cleanMainStreet = cleanVietnameseAddress(mainStreet);

  console.log('🧹 Cleaned address:', { 
    cleanStreet, 
    cleanMainStreet, 
    cleanWard, 
    cleanDistrict, 
    cleanProvince 
  });

  // Strategy: Thử nhiều format khác nhau (ưu tiên format có khả năng cao)
  const addressVariations = [
    // Format 1: Tên đường chính + Quận + Thành phố (CHÍNH XÁC NHẤT)
    cleanMainStreet.length > 3 ? `${cleanMainStreet}, ${cleanDistrict}, ${cleanProvince}, Vietnam` : null,
    
    // Format 2: Tên đường chính + Phường + Quận + Thành phố
    cleanMainStreet.length > 3 ? `${cleanMainStreet}, ${cleanWard}, ${cleanDistrict}, ${cleanProvince}, Vietnam` : null,
    
    // Format 3: Phường + Quận + Thành phố
    `${cleanWard}, ${cleanDistrict}, ${cleanProvince}, Vietnam`,
    
    // Format 4: Quận + Thành phố (fallback)
    `${cleanDistrict}, ${cleanProvince}, Vietnam`,
    
    // Format 5: Đảo ngược theo style Nominatim (Province → District → Ward)
    `${cleanProvince}, ${cleanDistrict}, ${cleanWard}, Vietnam`,
    
    // Format 6: Địa chỉ đầy đủ cleaned
    `${cleanStreet}, ${cleanWard}, ${cleanDistrict}, ${cleanProvince}, Vietnam`,
    
    // Format 7: Chỉ tỉnh/thành phố (last resort)
    `${cleanProvince}, Vietnam`,
  ].filter(Boolean) as string[];

  console.log('🔍 Will try', addressVariations.length, 'address formats');

  // Thử từng variation cho đến khi tìm được
  for (let i = 0; i < addressVariations.length; i++) {
    const address = addressVariations[i];
    console.log(`📍 Attempt ${i + 1}/${addressVariations.length}:`, address);
    
    const result = await geocodeAddress(address);
    if (result) {
      console.log(`✅ SUCCESS at attempt ${i + 1}`);
      return result;
    }
    
    // Delay 1.2 giây giữa các request (Nominatim rate limit: max 1 req/sec)
    if (i < addressVariations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  }

  console.log('❌ All geocoding attempts failed');
  return null;
};

/**
 * Tọa độ mặc định cho các tỉnh/thành phố lớn ở Việt Nam
 * Chỉ dùng khi không tìm được địa chỉ cụ thể
 */
const VIETNAM_CITY_COORDINATES: Record<string, Coordinates> = {
  'Hà Nội': { latitude: 21.0285, longitude: 105.8542 },
  'TP.HCM': { latitude: 10.8231, longitude: 106.6297 },
  'TP. Hồ Chí Minh': { latitude: 10.8231, longitude: 106.6297 },
  'Hồ Chí Minh': { latitude: 10.8231, longitude: 106.6297 },
  'Đà Nẵng': { latitude: 16.0544, longitude: 108.2022 },
  'Hải Phòng': { latitude: 20.8449, longitude: 106.6881 },
  'Cần Thơ': { latitude: 10.0452, longitude: 105.7469 },
  'Nha Trang': { latitude: 12.2388, longitude: 109.1967 },
  'Huế': { latitude: 16.4637, longitude: 107.5909 },
  'Vũng Tàu': { latitude: 10.3460, longitude: 107.0843 },
};

/**
 * Lấy tọa độ mặc định dựa vào tỉnh/thành phố
 */
export const getDefaultCityCoordinates = (province: string): Coordinates => {
  // Normalize province name
  const normalizedProvince = province.trim();
  
  // Tìm trong danh sách các thành phố lớn
  for (const [city, coords] of Object.entries(VIETNAM_CITY_COORDINATES)) {
    if (normalizedProvince.includes(city) || city.includes(normalizedProvince)) {
      return coords;
    }
  }
  
  // Mặc định: Hà Nội
  return DEFAULT_VIETNAM_COORDINATES;
};

/**
 * Tọa độ mặc định cho Việt Nam (trung tâm Hà Nội)
 */
export const DEFAULT_VIETNAM_COORDINATES: Coordinates = {
  latitude: 21.0285,
  longitude: 105.8542,
};

// ============================================
// GOOGLE GEOCODING API (Chính xác hơn)
// Uncomment phần này nếu muốn dùng Google API
// ============================================

/**
 * Google Geocoding API - ĐỘ CHÍNH XÁC CAO cho địa chỉ Việt Nam
 * Cần API key từ: https://console.cloud.google.com/
 * 
 * Pricing: $5 per 1000 requests (200$/month free)
 */
const GOOGLE_GEOCODING_API_KEY = ''; // Thêm API key của bạn vào đây

export const geocodeAddressGoogle = async (address: string): Promise<Coordinates | null> => {
  if (!GOOGLE_GEOCODING_API_KEY) {
    console.warn('⚠️ Google Geocoding API key not configured');
    return null;
  }

  try {
    console.log('🗺️ Google Geocoding:', address);
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address + ', Vietnam',
        key: GOOGLE_GEOCODING_API_KEY,
        language: 'vi', // Vietnamese
        region: 'vn', // Vietnam
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      const coords = {
        latitude: location.lat,
        longitude: location.lng,
      };
      console.log('✅ Google found:', coords, '- Address:', result.formatted_address);
      return coords;
    }

    console.log('❌ Google not found, status:', response.data.status);
    return null;
  } catch (error) {
    console.error('❌ Google Geocoding error:', error);
    return null;
  }
};

/**
 * Geocode với Google API (nếu có key) hoặc fallback về Nominatim
 */
export const geocodeFullAddressOptimized = async (
  streetAddress: string,
  ward: string,
  district: string,
  province: string
): Promise<Coordinates | null> => {
  // Thử Google trước (nếu có API key)
  if (GOOGLE_GEOCODING_API_KEY) {
    const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`;
    const googleResult = await geocodeAddressGoogle(fullAddress);
    if (googleResult) {
      return googleResult;
    }
    
    // Thử lại với địa chỉ ngắn hơn
    const shortAddress = `${district}, ${province}`;
    const googleResult2 = await geocodeAddressGoogle(shortAddress);
    if (googleResult2) {
      return googleResult2;
    }
  }

  // Fallback về Nominatim
  console.log('⚠️ Falling back to Nominatim (OSM)');
  return geocodeFullAddress(streetAddress, ward, district, province);
};

/**
 * AUTO GEOCODING: Tự động chọn provider tốt nhất
 * - Google (nếu có API key) → Nominatim (fallback) → City default
 */
export const geocodeAutomatic = async (
  streetAddress: string,
  ward: string,
  district: string,
  province: string
): Promise<Coordinates> => {
  const result = await geocodeFullAddressOptimized(streetAddress, ward, district, province);
  
  if (result) {
    return result;
  }

  // Cuối cùng fallback về tọa độ thành phố
  console.log('⚠️ Using default city coordinates');
  return getDefaultCityCoordinates(province);
};
