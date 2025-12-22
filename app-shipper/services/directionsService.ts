/**
 * Google Directions Service
 * Sử dụng Google Directions API để lấy route thực tế
 */

import Constants from 'expo-constants';

// Google Maps API Key
// Khuyến nghị: set biến môi trường `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
// (Expo sẽ inject vào app bundle) hoặc set trong `app.config.ts` qua `extra.googleMapsApiKey`.
const ENV_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const EXTRA_KEY = (Constants.expoConfig?.extra as { googleMapsApiKey?: string } | undefined)
  ?.googleMapsApiKey;

const GOOGLE_MAPS_API_KEY_RAW = ENV_KEY ?? EXTRA_KEY ?? '';

const GOOGLE_MAPS_API_KEY = (() => {
  const trimmed = (GOOGLE_MAPS_API_KEY_RAW ?? '').trim();
  if (!trimmed) return '';
  if (trimmed === 'YOUR_GOOGLE_MAPS_API_KEY' || trimmed.includes('YourGoogleMapsAPIKeyHere')) return '';
  return trimmed;
})();

export function getDirectionsKeyDebugInfo() {
  const source = ENV_KEY ? 'env' : EXTRA_KEY ? 'expoExtra' : 'none';
  const key = GOOGLE_MAPS_API_KEY;
  return {
    source,
    hasKey: Boolean(key),
    keyLength: key.length,
  };
}

const directionsCache = new Map<string, DirectionsResult>();

interface DirectionsResult {
  coordinates: { latitude: number; longitude: number }[];
  distance: string;
  duration: string;
}

/**
 * Lấy directions từ Google Maps Directions API
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DirectionsResult> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error(
        'Missing Google Maps API key. Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY then restart Expo with --clear.'
      );
    }

    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${destination.lat},${destination.lng}`;

    const cacheKey = `driving:${originStr}->${destStr}`;
    const cached = directionsCache.get(cacheKey);
    if (cached) return cached;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      originStr
    )}&destination=${encodeURIComponent(destStr)}&mode=driving&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      // Decode polyline để lấy tất cả các điểm trên đường
      const points = decodePolyline(route.overview_polyline.points);
      
      const result = {
        coordinates: points,
        distance: leg.distance.text,
        duration: leg.duration.text,
      };

      directionsCache.set(cacheKey, result);
      return result;
    } else {
      const message =
        typeof data?.error_message === 'string' && data.error_message
          ? `Directions API error: ${data.status} - ${data.error_message}`
          : `Directions API error: ${data.status}`;

      if (data.status === 'REQUEST_DENIED') {
        throw new Error(
          `${message}. Common causes: invalid key, Directions API not enabled, billing not enabled, or key restrictions blocking web service calls.`
        );
      }
      throw new Error(message);
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }
}

/**
 * Decode Google Maps polyline encoding
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

/**
 * Mock directions cho development (không cần API key)
 * Tạo đường đi theo grid đường phố giống thực tế
 */
export async function getMockDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DirectionsResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const coordinates: { latitude: number; longitude: number }[] = [];
  
  // Thêm điểm bắt đầu
  coordinates.push({ latitude: origin.lat, longitude: origin.lng });
  
  // Tính khoảng cách giữa 2 điểm
  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;
  
  // Số điểm trung gian để tạo đường mượt
  const numPoints = 50;
  
  // Tạo đường cong tự nhiên
  for (let i = 1; i < numPoints; i++) {
    const t = i / numPoints;
    
    // Sử dụng ease-in-out để đường cong mượt hơn
    const smoothT = t < 0.5 
      ? 2 * t * t 
      : -1 + (4 - 2 * t) * t;
    
    // Tính toán vị trí cơ bản
    let lat = origin.lat + latDiff * smoothT;
    let lng = origin.lng + lngDiff * smoothT;
    
    // Thêm offset để tạo đường đi không thẳng (giả lập đường phố)
    // Sử dụng sin wave để tạo độ cong
    const waveFactor = Math.sin(t * Math.PI);
    const offsetLat = waveFactor * 0.001 * Math.abs(lngDiff);
    const offsetLng = waveFactor * 0.001 * Math.abs(latDiff);
    
    lat += offsetLat;
    lng += offsetLng;
    
    coordinates.push({ latitude: lat, longitude: lng });
  }
  
  // Thêm điểm kết thúc
  coordinates.push({ latitude: destination.lat, longitude: destination.lng });
  
  // Tính khoảng cách Haversine
  const R = 6371; // km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * Math.PI / 180) *
      Math.cos(destination.lat * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  
  // Đường thật dài hơn đường thẳng (do phải đi theo đường phố)
  const actualDistance = straightDistance * 1.2;

  return {
    coordinates,
    distance: `${actualDistance.toFixed(1)} km`,
    duration: `${Math.round(actualDistance * 3)} phút`,
  };
}
