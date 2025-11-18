# 📚 Story 18: User Thuê Sách (Ebook) - API Documentation

## 📝 Tổng Quan

Hệ thống cho phép:
- Admin tạo và quản lý các gói thuê sách (RentalPlan)
- User mua gói thuê → Có quyền đọc ebook trong thời hạn gói
- Admin upload file ebook (.pdf, .epub) lên MinIO bucket `ebook-files`
- User lấy Pre-signed URL (có hạn 10 phút) để đọc ebook
- Tự động kiểm tra subscription còn hạn trước khi cho access

---

## 🗂️ Database Schema

### **Table: RentalPlans**
Gói thuê sách (7 ngày, 30 ngày, 90 ngày...)

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary Key |
| Name | string | Tên gói (VD: "Gói 7 ngày", "Gói tháng") |
| Description | string? | Mô tả gói |
| Price | decimal | Giá gói (VND) |
| DurationDays | int | Số ngày của gói |
| IsActive | bool | Gói có đang hoạt động không |
| CreatedAt | DateTime | Ngày tạo |

### **Table: UserSubscriptions** (Story 18)
Lịch sử user đã mua gói nào

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary Key |
| UserId | Guid | FK → Users |
| RentalPlanId | Guid | FK → RentalPlans |
| StartDate | DateTime | Ngày bắt đầu gói |
| EndDate | DateTime | Ngày hết hạn |
| Status | string | Active, Expired, Cancelled |
| IsPaid | bool | Đã thanh toán chưa |
| PaymentTransactionCode | string? | Mã giao dịch thanh toán |
| CreatedAt | DateTime | Ngày mua gói |
| UpdatedAt | DateTime? | Ngày cập nhật cuối |

**Helper Method:**
```csharp
public bool IsValid() => Status == "Active" && IsPaid && DateTime.UtcNow < EndDate;
```

---

## 🎯 API Endpoints

### **1. Quản Lý Gói Thuê (Admin)**

#### **GET /api/rental/plans** - Lấy tất cả gói (Admin)
```http
GET /api/rental/plans
Authorization: Bearer {admin_token}

Response 200:
[
  {
    "id": "guid",
    "name": "Gói 7 ngày",
    "description": "Đọc không giới hạn trong 7 ngày",
    "price": 50000,
    "durationDays": 7,
    "isActive": true,
    "createdAt": "2025-11-18T10:00:00Z"
  }
]
```

#### **GET /api/rental/plans/active** - Lấy các gói đang active (Public)
```http
GET /api/rental/plans/active

Response 200:
[
  {
    "id": "guid",
    "name": "Gói 30 ngày",
    "description": "Đọc không giới hạn trong 1 tháng",
    "price": 150000,
    "durationDays": 30,
    "isActive": true,
    "createdAt": "2025-11-18T10:00:00Z"
  }
]
```

#### **POST /api/rental/plans** - Tạo gói mới (Admin)
```http
POST /api/rental/plans
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "name": "Gói 7 ngày",
  "description": "Đọc không giới hạn trong 7 ngày",
  "price": 50000,
  "durationDays": 7
}

Response 201:
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Gói 7 ngày",
  "price": 50000,
  "durationDays": 7,
  "isActive": true,
  "createdAt": "2025-11-18T10:00:00Z"
}
```

#### **PUT /api/rental/plans/{id}** - Cập nhật gói (Admin)
```http
PUT /api/rental/plans/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {admin_token}

Body:
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Gói 7 ngày (Giảm giá)",
  "description": "Đọc không giới hạn trong 7 ngày - Khuyến mãi",
  "price": 40000,
  "durationDays": 7,
  "isActive": true
}

Response 200: RentalPlanDto
```

#### **DELETE /api/rental/plans/{id}** - Xóa gói (Admin)
```http
DELETE /api/rental/plans/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {admin_token}

Response 204: No Content
```

---

### **2. User Mua Gói Thuê**

#### **POST /api/rental/subscriptions/subscribe** - User mua gói
```http
POST /api/rental/subscriptions/subscribe
Authorization: Bearer {user_token}
Content-Type: application/json

Body:
{
  "rentalPlanId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "paymentMethod": "Online"  // hoặc "Cash"
}

Response 200:
{
  "success": true,
  "message": "Vui lòng quét mã QR để thanh toán",
  "subscription": {
    "id": "guid",
    "userId": "user-guid",
    "userEmail": "user@example.com",
    "rentalPlan": {
      "id": "plan-guid",
      "name": "Gói 7 ngày",
      "price": 50000,
      "durationDays": 7
    },
    "startDate": "2025-11-18T10:00:00Z",
    "endDate": "2025-11-25T10:00:00Z",
    "status": "Active",
    "isPaid": false,
    "paymentTransactionCode": "SUB-20251118-abc123",
    "isValid": false
  },
  "qrCodeUrl": "https://qr.vietqr.io/...",
  "paymentTransactionCode": "SUB-20251118-abc123"
}
```

**Lưu ý:**
- Nếu `paymentMethod` = "Cash" → `isPaid` = true ngay lập tức
- Nếu `paymentMethod` = "Online" → Tạo QR code, chờ callback thanh toán
- User chỉ được mua 1 gói tại 1 thời điểm (không có subscription active)

---

#### **GET /api/rental/subscriptions/check** - Kiểm tra user có gói còn hạn không
```http
GET /api/rental/subscriptions/check
Authorization: Bearer {user_token}

Response 200:
{
  "hasActiveSubscription": true,
  "activeSubscription": {
    "id": "guid",
    "rentalPlan": {
      "name": "Gói 30 ngày",
      "durationDays": 30
    },
    "startDate": "2025-11-01T10:00:00Z",
    "endDate": "2025-12-01T10:00:00Z",
    "status": "Active",
    "isPaid": true,
    "isValid": true
  }
}
```

---

#### **GET /api/rental/subscriptions/active** - Lấy gói đang active
```http
GET /api/rental/subscriptions/active
Authorization: Bearer {user_token}

Response 200: UserSubscriptionDto

Response 404:
{
  "message": "Bạn chưa có gói thuê hoặc gói đã hết hạn"
}
```

---

#### **GET /api/rental/subscriptions/my** - Lịch sử mua gói của user
```http
GET /api/rental/subscriptions/my
Authorization: Bearer {user_token}

Response 200:
[
  {
    "id": "guid",
    "rentalPlan": { "name": "Gói 7 ngày", "price": 50000 },
    "startDate": "2025-11-18T10:00:00Z",
    "endDate": "2025-11-25T10:00:00Z",
    "status": "Expired",
    "isPaid": true,
    "isValid": false
  },
  {
    "id": "guid",
    "rentalPlan": { "name": "Gói 30 ngày", "price": 150000 },
    "startDate": "2025-11-20T10:00:00Z",
    "endDate": "2025-12-20T10:00:00Z",
    "status": "Active",
    "isPaid": true,
    "isValid": true
  }
]
```

---

### **3. Upload & Access Ebook**

#### **POST /api/rental/books/{bookId}/upload** - Admin upload ebook (Admin)
```http
POST /api/rental/books/3fa85f64-5717-4562-b3fc-2c963f66afa6/upload
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Body:
- file: [ebook.pdf]

Response 200:
{
  "success": true,
  "message": "Upload ebook thành công",
  "fileUrl": "http://minio:9000/ebook-files/3fa85f64-5717-4562-b3fc-2c963f66afa6.pdf",
  "fileName": "3fa85f64-5717-4562-b3fc-2c963f66afa6.pdf"
}
```

**Lưu ý:**
- File được lưu với tên: `{bookId}.pdf` hoặc `{bookId}.epub`
- Bucket: `ebook-files`
- Chỉ chấp nhận: PDF, EPUB, MOBI

---

#### **GET /api/rental/books/{bookId}/access-link** - User lấy link đọc ebook
```http
GET /api/rental/books/3fa85f64-5717-4562-b3fc-2c963f66afa6/access-link
Authorization: Bearer {user_token}

Response 200:
{
  "bookId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "bookTitle": "Clean Code",
  "accessUrl": "http://minio:9000/ebook-files/3fa85f64-5717-4562-b3fc-2c963f66afa6.pdf?X-Amz-Expires=600&...",
  "expiresAt": "2025-11-18T10:10:00Z",
  "message": "Link đọc ebook có hiệu lực trong 10 phút"
}

Response 400 (Nếu không có subscription):
{
  "message": "Bạn chưa có gói thuê hoặc gói thuê đã hết hạn. Vui lòng mua gói để đọc ebook."
}

Response 400 (Nếu ebook chưa upload):
{
  "message": "Sách này chưa có file ebook. Vui lòng liên hệ admin."
}
```

**Flow:**
1. Kiểm tra user có subscription còn hạn không
2. Kiểm tra book có file ebook trong MinIO không
3. Generate Pre-signed URL (hết hạn sau 10 phút - 600 seconds)
4. Trả về URL cho user

---

#### **GET /api/rental/books/{bookId}/exists** - Kiểm tra ebook có tồn tại không (Admin)
```http
GET /api/rental/books/3fa85f64-5717-4562-b3fc-2c963f66afa6/exists
Authorization: Bearer {admin_token}

Response 200:
{
  "exists": true
}
```

---

#### **DELETE /api/rental/books/{bookId}/ebook** - Xóa ebook (Admin)
```http
DELETE /api/rental/books/3fa85f64-5717-4562-b3fc-2c963f66afa6/ebook
Authorization: Bearer {admin_token}

Response 204: No Content
```

---

### **4. Admin Quản Lý Subscriptions**

#### **GET /api/rental/subscriptions/all** - Lấy tất cả subscriptions (Admin)
```http
GET /api/rental/subscriptions/all
Authorization: Bearer {admin_token}

Response 200: UserSubscriptionDto[]
```

---

#### **DELETE /api/rental/subscriptions/{id}** - Hủy subscription (Admin)
```http
DELETE /api/rental/subscriptions/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {admin_token}

Response 204: No Content
```

---

#### **POST /api/rental/subscriptions/update-expired** - Cập nhật subscriptions hết hạn (Background Job)
```http
POST /api/rental/subscriptions/update-expired
Authorization: Bearer {admin_token}

Response 200:
{
  "message": "Đã cập nhật các subscription hết hạn"
}
```

**Chức năng:**
- Tìm tất cả subscription có `Status = "Active"` và `EndDate <= Now`
- Cập nhật `Status` → `"Expired"`
- Nên chạy định kỳ (cronjob/background service)

---

## 🔄 Flow Hoàn Chỉnh

### **Flow 1: User Mua Gói & Đọc Ebook**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Xem Các Gói Thuê                                    │
│    GET /api/rental/plans/active                             │
│    ↓                                                         │
│    Response: Danh sách gói (7 ngày, 30 ngày, 90 ngày...)    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User Chọn Gói & Mua                                      │
│    POST /api/rental/subscriptions/subscribe                 │
│    Body: { rentalPlanId, paymentMethod: "Online" }          │
│    ↓                                                         │
│    Tạo UserSubscription (Status: Active, IsPaid: false)     │
│    Tạo QR code thanh toán                                   │
│    Response: { qrCodeUrl, transactionCode }                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User Thanh Toán                                          │
│    Quét QR code → Payment Gateway                           │
│    ↓                                                         │
│    Payment Gateway callback → Backend                        │
│    ↓                                                         │
│    UserSubscription: IsPaid = true ✅                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User Kiểm Tra Subscription                               │
│    GET /api/rental/subscriptions/check                      │
│    ↓                                                         │
│    Response: { hasActiveSubscription: true }                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. User Đọc Ebook                                           │
│    GET /api/rental/books/{bookId}/access-link               │
│    ↓                                                         │
│    Backend kiểm tra:                                         │
│    - User có subscription còn hạn không? ✅                 │
│    - Book có file ebook không? ✅                           │
│    ↓                                                         │
│    Generate Pre-signed URL (hết hạn 10 phút)                │
│    Response: { accessUrl, expiresAt }                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. User Mở Link & Đọc Ebook                                 │
│    Trình duyệt hoặc app mở URL:                              │
│    http://minio:9000/ebook-files/{bookId}.pdf?...           │
│    ↓                                                         │
│    MinIO serve file (link hết hạn sau 10 phút)              │
└─────────────────────────────────────────────────────────────┘
```

---

### **Flow 2: Admin Upload Ebook**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin Chọn Book Cần Upload Ebook                         │
│    POST /api/rental/books/{bookId}/upload                   │
│    Body: multipart/form-data - file (PDF/EPUB)              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Xử Lý                                            │
│    - Validate file type (PDF, EPUB, MOBI)                    │
│    - Upload lên MinIO bucket "ebook-files"                   │
│    - Tên file: {bookId}.pdf hoặc {bookId}.epub              │
│    ↓                                                         │
│    Response: { success: true, fileUrl }                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. File Được Lưu Trong MinIO                                │
│    Bucket: ebook-files                                      │
│    Path: /ebook-files/{bookId}.pdf                          │
│    ↓                                                         │
│    User có subscription sẽ lấy được Pre-signed URL          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Business Logic Quan Trọng

### **1. Kiểm Tra User Có Subscription Còn Hạn**
```csharp
public async Task<bool> HasActiveSubscriptionAsync(Guid userId)
{
    return await _context.UserSubscriptions
        .AnyAsync(us => us.UserId == userId
            && us.Status == "Active"
            && us.IsPaid
            && us.EndDate > DateTime.UtcNow);
}
```

### **2. Generate Pre-signed URL (10 phút)**
```csharp
var expiryInSeconds = 600; // 10 phút
var accessUrl = await _minioService.GetPresignedUrlAsync(
    fileName: $"{bookId}.pdf",
    expiryInSeconds: expiryInSeconds,
    bucketName: "ebook-files"
);
```

### **3. Tự Động Cập Nhật Subscription Hết Hạn**
Nên chạy định kỳ (cronjob):
```csharp
public async Task UpdateExpiredSubscriptionsAsync()
{
    var expired = await _context.UserSubscriptions
        .Where(us => us.Status == "Active" && us.EndDate <= DateTime.UtcNow)
        .ToListAsync();

    foreach (var sub in expired)
    {
        sub.Status = "Expired";
        sub.UpdatedAt = DateTime.UtcNow;
    }

    await _context.SaveChangesAsync();
}
```

---

## 🚀 Deployment & Configuration

### **1. MinIO Configuration**
Cần tạo bucket `ebook-files`:
```bash
# Tạo bucket trong MinIO
mc mb myminio/ebook-files

# Set public read access (nếu cần)
mc anonymous set download myminio/ebook-files
```

### **2. Dependency Injection (Program.cs)**
```csharp
// Rental Services (Story 18)
builder.Services.AddScoped<IRentalPlanRepository, RentalPlanRepository>();
builder.Services.AddScoped<IUserSubscriptionRepository, UserSubscriptionRepository>();
builder.Services.AddScoped<IRentalPlanService, RentalPlanService>();
builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
builder.Services.AddScoped<IEbookService, EbookService>();
```

### **3. Database Migration**
```bash
# Tạo migration
dotnet ef migrations add AddUserSubscriptionTable --project BookStore.Infrastructure --startup-project BookStore.API

# Apply migration
dotnet ef database update --project BookStore.Infrastructure --startup-project BookStore.API
```

---

## 🧪 Test Scenarios

### **Test 1: User Mua Gói & Đọc Ebook**
```bash
# 1. Login user
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }

# 2. Xem gói thuê
GET /api/rental/plans/active

# 3. Mua gói
POST /api/rental/subscriptions/subscribe
{ "rentalPlanId": "guid", "paymentMethod": "Cash" }

# 4. Kiểm tra subscription
GET /api/rental/subscriptions/check

# 5. Lấy link đọc ebook
GET /api/rental/books/{bookId}/access-link

# 6. Mở URL trong browser
```

### **Test 2: Admin Upload Ebook**
```bash
# 1. Login admin
POST /api/auth/login
{ "email": "admin@example.com", "password": "admin" }

# 2. Upload ebook
POST /api/rental/books/{bookId}/upload
Body: multipart/form-data - file (ebook.pdf)

# 3. Kiểm tra file đã upload
GET /api/rental/books/{bookId}/exists
```

---

## ✅ Summary

**Story 18 - Ebook Rental System:**

1. ✅ RentalPlan Entity & CRUD APIs
2. ✅ UserSubscription Entity (user đã mua gói nào)
3. ✅ API mua gói thuê cho user
4. ✅ Kiểm tra subscription còn hạn
5. ✅ Upload ebook lên MinIO bucket `ebook-files`
6. ✅ Generate Pre-signed URL (hết hạn 10 phút) để user đọc ebook
7. ✅ Tự động cập nhật subscription hết hạn

**API Endpoints:**
- `/api/rental/plans` - CRUD gói thuê
- `/api/rental/subscriptions` - Mua gói, kiểm tra, lịch sử
- `/api/rental/books/{id}/upload` - Upload ebook
- `/api/rental/books/{id}/access-link` - Lấy link đọc ebook

**Bảo mật:**
- Pre-signed URL có hạn 10 phút
- Chỉ user có subscription còn hạn mới lấy được link
- Admin upload ebook, user chỉ có quyền đọc

🎉 **Hoàn thành Story 18!**
