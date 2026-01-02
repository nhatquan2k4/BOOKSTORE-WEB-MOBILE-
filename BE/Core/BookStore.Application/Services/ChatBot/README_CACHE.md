# ChatBot Cache System - Hướng dẫn

## Tổng quan

Hệ thống cache cho ChatBot đã được cải tiến để:
- ✅ **Lấy TẤT CẢ sách và thể loại** khi ứng dụng khởi động
- ✅ **Lưu vào Memory Cache** để truy xuất nhanh
- ✅ **Không cần gọi DB mỗi lần** chat
- ✅ **Tự động refresh cache** mỗi 1 giờ
- ✅ **Hỗ trợ refresh thủ công** qua API

## Cấu trúc

### 1. DTO Classes
- `CachedBookDto`: Chứa thông tin sách đã tối ưu cho cache
- `CachedCategoryDto`: Chứa thông tin thể loại

### 2. Services
- `IBookDataCacheService`: Interface cho cache service
- `BookDataCacheService`: Implementation - quản lý cache trong memory

### 3. Background Service
- `BookCacheInitializerService`: 
  - Load cache khi app khởi động (sau 2 giây)
  - Auto refresh mỗi 1 giờ

### 4. Updated Services
- `ChatBotService`: 
  - Đã được cập nhật để sử dụng cache thay vì query DB
  - Tăng số sách từ 5 lên 10 cuốn (vì cache nhanh hơn)
  - Thêm thông tin thể loại vào prompt

## API Endpoints

### 1. Chat với Bot (không đổi)
```http
POST /api/chatbot/ask
Content-Type: application/json

{
  "message": "Tìm sách về lập trình"
}
```

### 2. Kiểm tra trạng thái Cache
```http
GET /api/chatbot/cache/status

Response:
{
  "isCacheLoaded": true,
  "bookCount": 150,
  "categoryCount": 20
}
```

### 3. Refresh Cache thủ công (chỉ Admin)
```http
POST /api/chatbot/cache/refresh
Authorization: Bearer <admin-token>

Response:
{
  "message": "Cache refreshed successfully"
}
```

## Cải tiến so với phiên bản cũ

| Tính năng | Trước | Sau |
|-----------|-------|-----|
| Số sách query | 5 cuốn | TẤT CẢ sách (load 1 lần) |
| Thể loại | ❌ Không có | ✅ Có đầy đủ |
| Gọi DB mỗi request | ✅ Có | ❌ Không (chỉ cache) |
| Số sách gửi AI | 5 cuốn | 10 cuốn |
| Thông tin sách | Cơ bản | Chi tiết (tác giả, thể loại, NXB, tồn kho) |
| Auto refresh | ❌ Không | ✅ Mỗi 1 giờ |

## Cấu hình Program.cs

Đã được thêm vào `Program.cs`:

```csharp
// Register Cache Service
builder.Services.AddScoped<IBookDataCacheService, BookDataCacheService>();

// Register Background Service
builder.Services.AddHostedService<BookCacheInitializerService>();
```

## Logs

Hệ thống sẽ log các thông tin:

```
[BookDataCache] Starting to load all books and categories into cache...
[BookDataCache] Successfully loaded 150 books and 20 categories in 2345ms
[BookCacheInitializer] Cache initialization completed successfully
[ChatBot] Search for 'lập trình' returned 25 results from cache
```

## Hiệu suất

- **Load cache**: ~2-5 giây (tùy số lượng sách)
- **Search trong cache**: < 10ms
- **Memory usage**: ~5-10MB cho 1000 sách

## Lưu ý

1. **Khi nào cache được load?**
   - Khi app khởi động (sau 2 giây)
   - Mỗi 1 giờ tự động refresh
   - Khi admin gọi API refresh

2. **Nếu cache chưa sẵn sàng?**
   - ChatBot sẽ trả về: "Hệ thống đang khởi động, vui lòng thử lại sau vài giây"

3. **Khi nào nên refresh thủ công?**
   - Sau khi thêm/sửa/xóa sách
   - Sau khi cập nhật giá
   - Sau khi thêm thể loại mới

## Testing

1. Khởi động ứng dụng
2. Đợi 2-3 giây
3. Kiểm tra status: `GET /api/chatbot/cache/status`
4. Chat test: `POST /api/chatbot/ask` với message "Tìm sách về lập trình"

## Tương lai

Có thể mở rộng:
- ✅ Distributed Cache (Redis) cho multi-server
- ✅ Partial cache update (chỉ update sách mới)
- ✅ Cache invalidation khi có thay đổi DB
- ✅ Cache preloading strategies
