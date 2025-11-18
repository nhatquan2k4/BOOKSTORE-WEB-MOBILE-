# 🚀 Story 18: Hướng Dẫn Chạy Migration & Setup

## 📝 Các Bước Setup

### **Bước 1: Build Project để fix compile errors**
```powershell
cd e:\CDTH\BOOKSTORE-WEB-MOBILE-\BE

# Clean solution
dotnet clean

# Restore packages
dotnet restore

# Build
dotnet build
```

---

### **Bước 2: Tạo Migration cho UserSubscriptions**
```powershell
# Tạo migration
dotnet ef migrations add AddUserSubscriptionTable `
  --project Core\BookStore.Infrastructure\BookStore.Infrastructure.csproj `
  --startup-project Core\BookStore.API\BookStore.API.csproj

# Apply migration
dotnet ef database update `
  --project Core\BookStore.Infrastructure\BookStore.Infrastructure.csproj `
  --startup-project Core\BookStore.API\BookStore.API.csproj
```

---

### **Bước 3: Tạo Bucket trong MinIO**

**Option 1: Qua MinIO Web Console**
1. Mở http://localhost:9001 (MinIO Console)
2. Login với credentials trong docker-compose
3. Tạo bucket mới: `ebook-files`
4. Set policy: Download only (public read)

**Option 2: Qua MinIO Client (mc)**
```bash
# Install mc (MinIO Client) nếu chưa có
# Windows: https://min.io/docs/minio/windows/reference/minio-mc.html

# Configure mc
mc alias set myminio http://localhost:9000 minioadmin minioadmin123

# Tạo bucket
mc mb myminio/ebook-files

# Set public read
mc anonymous set download myminio/ebook-files
```

---

### **Bước 4: Seed Data Gói Thuê (Optional)**

Tạo file seed data hoặc chạy SQL:

```sql
INSERT INTO RentalPlans (Id, Name, Description, Price, DurationDays, IsActive, CreatedAt)
VALUES
  (NEWID(), N'Gói 7 ngày', N'Đọc không giới hạn trong 7 ngày', 50000, 7, 1, GETUTCDATE()),
  (NEWID(), N'Gói 30 ngày', N'Đọc không giới hạn trong 1 tháng', 150000, 30, 1, GETUTCDATE()),
  (NEWID(), N'Gói 90 ngày', N'Đọc không giới hạn trong 3 tháng', 400000, 90, 1, GETUTCDATE());
```

Hoặc gọi API:
```http
POST /api/rental/plans
Authorization: Bearer {admin_token}

Body:
{
  "name": "Gói 7 ngày",
  "description": "Đọc không giới hạn trong 7 ngày",
  "price": 50000,
  "durationDays": 7
}
```

---

### **Bước 5: Chạy API**
```powershell
cd Core\BookStore.API
dotnet run
```

Hoặc press F5 trong Visual Studio.

---

### **Bước 6: Test APIs**

#### **1. Tạo gói thuê (Admin)**
```http
POST http://localhost:5276/api/rental/plans
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Gói 7 ngày",
  "description": "Đọc không giới hạn trong 7 ngày",
  "price": 50000,
  "durationDays": 7
}
```

#### **2. User mua gói**
```http
POST http://localhost:5276/api/rental/subscriptions/subscribe
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "rentalPlanId": "{plan-id-from-step-1}",
  "paymentMethod": "Cash"
}
```

#### **3. Admin upload ebook**
```http
POST http://localhost:5276/api/rental/books/{bookId}/upload
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Body:
- file: [ebook.pdf]
```

#### **4. User lấy link đọc ebook**
```http
GET http://localhost:5276/api/rental/books/{bookId}/access-link
Authorization: Bearer {user_token}
```

---

## 🔧 Troubleshooting

### **Error: Compile error về GenericRepository**
**Fix:** Build lại project
```powershell
dotnet clean
dotnet restore
dotnet build
```

### **Error: Cannot connect to MinIO**
**Fix:** Kiểm tra docker-compose
```powershell
cd docker
docker-compose ps
docker-compose up -d
```

### **Error: Migration không apply**
**Fix:** Xóa migration cũ và tạo lại
```powershell
# Xóa migration cuối
dotnet ef migrations remove --project Core\BookStore.Infrastructure --startup-project Core\BookStore.API

# Tạo lại
dotnet ef migrations add AddUserSubscriptionTable --project Core\BookStore.Infrastructure --startup-project Core\BookStore.API

# Apply
dotnet ef database update --project Core\BookStore.Infrastructure --startup-project Core\BookStore.API
```

---

## ✅ Checklist

- [ ] Build project thành công
- [ ] Migration đã apply vào database
- [ ] Table `UserSubscriptions` đã tồn tại trong database
- [ ] MinIO bucket `ebook-files` đã được tạo
- [ ] API chạy thành công
- [ ] Swagger documentation hiển thị đầy đủ endpoints `/api/rental/*`
- [ ] Admin có thể tạo gói thuê
- [ ] User có thể mua gói
- [ ] Admin có thể upload ebook
- [ ] User có thể lấy Pre-signed URL để đọc ebook

---

## 📊 Verify Database

Kiểm tra tables đã được tạo:
```sql
-- Kiểm tra RentalPlans table
SELECT * FROM RentalPlans;

-- Kiểm tra UserSubscriptions table
SELECT * FROM UserSubscriptions;

-- Kiểm tra structure
sp_help UserSubscriptions;
```

---

## 🎉 Done!

Sau khi hoàn thành các bước trên, Story 18 đã sẵn sàng sử dụng!

**Next Steps:**
1. Tích hợp payment gateway cho subscription
2. Tạo background job tự động cập nhật subscription hết hạn
3. Thêm notification khi subscription sắp hết hạn
4. Tạo dashboard thống kê subscription
