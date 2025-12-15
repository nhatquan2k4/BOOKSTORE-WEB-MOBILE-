# Hướng dẫn cấu hình Google Maps Directions API

## Hiện tại

App đang sử dụng **Mock Directions** - tạo đường đi giả lập với các điểm cong tự nhiên, không cần API key.

**Ưu điểm:**
- ✅ Không cần API key
- ✅ Không tốn tiền
- ✅ Hoạt động offline
- ✅ Đủ dùng để demo và test

**Nhược điểm:**
- ⚠️ Không phải đường đi thực tế
- ⚠️ Không tính chính xác khoảng cách/thời gian
- ⚠️ Không tránh tắc đường, không theo road network

---

## Nâng cấp lên Google Directions API (Tùy chọn)

Nếu muốn sử dụng **đường đi thực tế 100%** như Google Maps:

### Bước 1: Lấy Google Maps API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật các API sau:
   - **Directions API** (bắt buộc - để lấy đường đi)
   - **Maps SDK for Android** (nếu chạy trên Android)
   - **Maps SDK for iOS** (nếu chạy trên iOS)
4. Vào **Credentials** → **Create Credentials** → **API Key**
5. Copy API key (dạng: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
6. **Hạn chế API key** (bảo mật):
   - Application restrictions: Chọn "Android apps" hoặc "iOS apps"
   - API restrictions: Chọn "Restrict key" và chọn các API đã bật

### Bước 2: Thêm API Key vào app

**Cách 1: Thêm vào `app.json`** (Khuyến nghị cho React Native)

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**Cách 2: Thêm vào file service**

Mở `services/directionsService.ts`:

```typescript
// Thay YOUR_GOOGLE_MAPS_API_KEY bằng key thật
const GOOGLE_MAPS_API_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
```

### Bước 3: Chuyển từ Mock sang API thật

Mở `app/(stack)/map-navigation.tsx`, tìm dòng:

```typescript
const result = await getMockDirections(
```

Thay bằng:

```typescript
const result = await getDirections(
```

**Lưu ý:** Hãy import `getDirections` thay vì `getMockDirections`:

```typescript
import { getDirections } from '@/services/directionsService';
```

### Bước 4: Test

1. Rebuild app: `npm start` → nhấn `c` để clear cache
2. Chạy trên thiết bị thật (emulator có thể bị giới hạn)
3. Kiểm tra console xem có lỗi API không

---

## Chi phí

Google Maps Platform có **$200 free credit mỗi tháng**.

**Directions API:**
- $5 cho mỗi 1,000 requests
- Với $200 free = **40,000 requests miễn phí/tháng**
- ≈ **1,333 requests/ngày**

→ Đủ cho app nhỏ và vừa!

**Ví dụ sử dụng:**
- 10 shipper x 100 đơn/ngày = 1,000 requests → **Miễn phí**
- 50 shipper x 50 đơn/ngày = 2,500 requests → ~$0.35/ngày ≈ $10/tháng

---

## Giới hạn quota (Rate Limiting)

Để tránh vượt quota, có thể:

### 1. Cache routes
```typescript
// Lưu route đã tính toán để tái sử dụng
const routeCache = new Map();

export async function getDirectionsCached(origin, destination) {
  const key = `${origin.lat},${origin.lng}->${destination.lat},${destination.lng}`;
  
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }
  
  const result = await getDirections(origin, destination);
  routeCache.set(key, result);
  return result;
}
```

### 2. Fallback to mock
```typescript
try {
  const result = await getDirections(origin, destination);
  return result;
} catch (error) {
  console.warn('Directions API failed, using mock:', error);
  return await getMockDirections(origin, destination);
}
```

---

## So sánh Mock vs Real

| Tính năng | Mock Directions | Real Directions API |
|-----------|----------------|---------------------|
| Chi phí | Miễn phí | $5/1000 requests (có $200 free) |
| Độ chính xác | ~70% | 99% |
| Đường đi | Giả lập cong | Theo road network thực |
| Traffic | Không | Có (realtime) |
| Thời gian | Ước tính | Chính xác dựa traffic |
| Offline | ✅ Hoạt động | ❌ Cần internet |
| Setup | Không cần | Cần API key |

---

## Khuyến nghị

**Dùng Mock Directions khi:**
- ✅ Đang trong giai đoạn phát triển/test
- ✅ Chưa có budget cho API
- ✅ App nhỏ, không cần độ chính xác cao
- ✅ Muốn demo nhanh

**Chuyển sang Real Directions khi:**
- ✅ Sản phẩm chính thức ra mắt
- ✅ Cần độ chính xác cao
- ✅ Có nhiều shipper sử dụng
- ✅ Muốn tích hợp traffic realtime

---

## Troubleshooting

### Lỗi "API key not valid"
- Kiểm tra API key đã copy đúng chưa
- Đảm bảo đã bật Directions API
- Kiểm tra restrictions có chặn app không

### Lỗi "OVER_QUERY_LIMIT"
- Đã vượt quota miễn phí
- Bật billing trong Google Cloud Console
- Hoặc chuyển về dùng mock tạm thời

### Route không hiển thị
- Kiểm tra coordinates có hợp lệ không
- Xem console log có lỗi gì
- Thử với 2 địa điểm gần nhau trước

### Tốn pin/data
- Chỉ gọi API khi cần (khi bắt đầu navigation)
- Cache routes đã tính
- Không update route liên tục khi shipper di chuyển

---

## Bảo mật API Key

⚠️ **QUAN TRỌNG:**

1. **Không commit API key lên Git:**
   ```
   # .gitignore
   .env
   app.config.js
   ```

2. **Dùng environment variables:**
   ```typescript
   const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
   ```

3. **Hạn chế API key:**
   - Chỉ cho phép app của bạn sử dụng
   - Hạn chế theo package name (Android) / bundle ID (iOS)
   - Chỉ bật các API cần thiết

4. **Monitor usage:**
   - Kiểm tra usage trong Google Cloud Console định kỳ
   - Set budget alerts để tránh bị charge ngoài ý muốn

---

## Kết luận

Hiện tại app đang dùng **Mock Directions** - đủ dùng để test và demo.

Khi cần nâng cấp lên production, hãy:
1. Lấy Google Maps API Key
2. Thay `getMockDirections` → `getDirections`
3. Test kỹ trước khi release

Chúc bạn thành công! 🚀
