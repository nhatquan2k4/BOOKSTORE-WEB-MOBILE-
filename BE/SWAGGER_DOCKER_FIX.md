# 🔧 Sửa lỗi Swagger không chạy được trong Docker

## ❌ Vấn đề gặp phải
- Swagger không hiển thị được khi chạy Docker
- Upload file không hoạt động trong Swagger UI

## ✅ Các lỗi đã sửa trong Program.cs

### 1. **Thứ tự middleware sai**
**Trước:**
```csharp
app.MapControllers();
app.UseMiddleware<ExceptionMiddleware>();  // ❌ Sai vị trí
app.UseHttpsRedirection();  // ❌ Gọi 2 lần
```

**Sau:**
```csharp
// Exception handling middleware (must be first)
app.UseMiddleware<ExceptionMiddleware>();  // ✅ Đúng vị trí

// Swagger (Development only)
app.UseSwagger();
app.UseSwaggerUI();

// CORS, Authentication, Authorization
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers (cuối cùng)
app.MapControllers();
```

### 2. **Thiếu FileUploadOperationFilter**
**Trước:**
```csharp
builder.Services.AddSwaggerGen(c =>
{
    // ... JWT config
    // ❌ Không có filter cho upload file
});
```

**Sau:**
```csharp
builder.Services.AddSwaggerGen(c =>
{
    // ... JWT config
    
    // ✅ Add file upload support
    c.OperationFilter<FileUploadOperationFilter>();
});
```

### 3. **CORS thiếu origin cho Swagger**
**Trước:**
```csharp
policy.WithOrigins(
    "http://localhost:3000",   // Frontend
    "http://localhost:5173"    // Admin
    // ❌ Thiếu Swagger origin
);
```

**Sau:**
```csharp
policy.WithOrigins(
    "http://localhost:3000",    // Frontend
    "http://localhost:5173",    // Admin
    "http://localhost:5276",    // ✅ Swagger UI (Docker)
    "https://localhost:5276"    // ✅ Swagger UI HTTPS
);
```

## 🐳 Docker đã chạy thành công

### Kiểm tra containers:
```bash
docker ps
```

**Kết quả:**
```
CONTAINER          STATUS                   PORTS
bookstore-api      Up (healthy)            0.0.0.0:5276->8080/tcp
bookstore-minio    Up (healthy)            0.0.0.0:9000-9001->9000-9001/tcp
bookstore-sqlserver Up (healthy)           0.0.0.0:1433->1433/tcp
```

### Truy cập Swagger:
```
http://localhost:5276/swagger
```

### Truy cập MinIO Console:
```
http://localhost:9001
Username: minioadmin
Password: minioadmin123
```

## 📝 Các endpoint quan trọng

### Auth APIs:
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/verify-email
```

### Ebook Rental APIs:
```
# Admin upload ebook (ZIP chứa PDF/EPUB)
POST /api/rental/books/{bookId}/upload-zip

# User lấy link đọc ebook
GET /api/rental/books/{bookId}/access-link

# Subscription management
POST /api/rental/subscriptions/subscribe
GET /api/rental/subscriptions/my-subscription
```

## 🧪 Test Upload ZIP trong Swagger

1. **Login Admin:**
   - POST `/api/auth/login`
   - Body: `{ "email": "admin@bookstore.com", "password": "Admin@123" }`
   - Copy JWT token

2. **Authorize:**
   - Click nút **Authorize** (ổ khóa)
   - Nhập: `Bearer <token>`
   - Click **Authorize**

3. **Upload ZIP:**
   - POST `/api/rental/books/{bookId}/upload-zip`
   - Nhập `bookId` (GUID)
   - Click **Choose File** → chọn file ZIP (chứa PDF/EPUB)
   - Click **Execute**

4. **Kết quả:**
```json
{
  "success": true,
  "message": "Upload thành công. Đã giảm 35% dung lượng khi upload",
  "originalFileName": "truyen_tranh.pdf",
  "originalSize": 52428800,
  "compressedSize": 34078720,
  "compressionRatio": 35.00
}
```

## 🔍 Debug khi gặp lỗi

### Xem logs của container:
```bash
docker logs bookstore-api --tail 50
docker logs bookstore-api --follow  # Realtime logs
```

### Restart container:
```bash
docker restart bookstore-api
```

### Rebuild sau khi sửa code:
```bash
cd docker
docker-compose up -d --build bookstore-api
```

### Kiểm tra kết nối database:
```bash
docker exec -it bookstore-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Password123" \
  -Q "SELECT name FROM sys.databases" -C
```

## ✅ Checklist

- [x] Program.cs: Middleware đúng thứ tự
- [x] Program.cs: Thêm FileUploadOperationFilter
- [x] Program.cs: CORS cho Swagger origin
- [x] Docker container đang chạy
- [x] Swagger UI truy cập được tại http://localhost:5276/swagger
- [x] Upload file hoạt động trong Swagger
- [x] MinIO service healthy
- [x] SQL Server healthy
- [x] Database migrations applied

## 🎉 Kết quả

Swagger đã chạy thành công trong Docker! Bạn có thể:
- ✅ Truy cập Swagger UI
- ✅ Test tất cả APIs
- ✅ Upload file ZIP (ebook)
- ✅ Authenticate với JWT
- ✅ Xem schema và documentation

---

**Tạo bởi:** BookStore API Team
**Ngày:** 18/11/2025
