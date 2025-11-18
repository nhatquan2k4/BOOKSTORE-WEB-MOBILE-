# Story 17: User theo dõi Đơn hàng - API Documentation

## 📋 Tổng quan

Đã tạo đầy đủ hệ thống quản lý lịch sử trạng thái đơn hàng cho User Story 17, bao gồm:
- ✅ API lấy danh sách lịch sử đơn hàng
- ✅ API xem chi tiết đơn hàng  
- ✅ API cập nhật trạng thái đơn hàng (Admin)
- ✅ Tự động ghi lại lịch sử thay đổi trạng thái

---

## 🔌 Các API Endpoints

### 1. **Lấy Lịch Sử Đơn Hàng (User/Admin)**
```http
GET /api/orders/{orderId}/status-history
```

**Authorization:** Bearer Token (User phải sở hữu đơn hàng hoặc là Admin)

**Response Success (200):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20241118-123456",
    "oldStatus": "Pending",
    "newStatus": "Paid",
    "changedAt": "2024-11-18T10:30:00Z",
    "changedBy": "Admin"
  },
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20241118-123456",
    "oldStatus": "Paid",
    "newStatus": "Shipped",
    "changedAt": "2024-11-18T14:30:00Z",
    "changedBy": "System"
  }
]
```

**Response Error:**
- `401 Unauthorized` - Chưa đăng nhập
- `403 Forbidden` - Không có quyền xem đơn hàng này
- `404 Not Found` - Không tìm thấy đơn hàng

---

### 2. **Xem Chi Tiết Đơn Hàng**
```http
GET /api/orders/{orderId}
```

**Authorization:** Bearer Token

**Response Success (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
  "userName": "Nguyễn Văn A",
  "userEmail": "user@example.com",
  "status": "Shipped",
  "orderNumber": "ORD-20241118-123456",
  "totalAmount": 500000,
  "discountAmount": 50000,
  "finalAmount": 450000,
  "createdAt": "2024-11-18T10:00:00Z",
  "paidAt": "2024-11-18T10:30:00Z",
  "completedAt": null,
  "cancelledAt": null,
  "items": [
    {
      "id": "...",
      "bookId": "...",
      "bookTitle": "Clean Code",
      "bookISBN": "978-0132350884",
      "bookImageUrl": "https://...",
      "quantity": 2,
      "unitPrice": 250000,
      "subtotal": 500000
    }
  ],
  "address": {
    "recipientName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "province": "TP. Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "street": "123 Lê Lợi",
    "fullAddress": "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
  },
  "paymentTransaction": {
    "transactionCode": "VNPAY-123456",
    "paymentMethod": "Online",
    "status": "Paid",
    "amount": 450000
  }
}
```

---

### 3. **Cập Nhật Trạng Thái Đơn Hàng (Admin)**
```http
PUT /api/orders/status
```

**Authorization:** Bearer Token (Role: Admin)

**Request Body:**
```json
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Shipped",
  "note": "Đơn hàng đã được giao cho đơn vị vận chuyển"
}
```

**Status Values:**
- `Pending` - Chờ xử lý
- `AwaitingPayment` - Chờ thanh toán
- `Paid` - Đã thanh toán
- `Shipped` - Đang giao hàng
- `Completed` - Hoàn thành
- `Cancelled` - Đã hủy

**Response Success (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "Shipped",
  "orderNumber": "ORD-20241118-123456",
  ...
}
```

**Lưu ý:** 
- ✅ Tự động tạo log trong bảng `OrderStatusLog` khi cập nhật trạng thái
- ✅ Ghi lại thời gian và người thay đổi

---

### 4. **Danh Sách Đơn Hàng Của User**
```http
GET /api/orders/my-orders?status=Shipped&pageNumber=1&pageSize=10
```

**Authorization:** Bearer Token

**Query Parameters:**
- `status` (optional): Lọc theo trạng thái
- `pageNumber` (optional, default: 1): Trang hiện tại
- `pageSize` (optional, default: 10): Số items mỗi trang

**Response Success (200):**
```json
{
  "items": [...],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

---

## 🗂️ Cấu trúc Database

### Bảng: `OrderStatusLog`
```sql
CREATE TABLE OrderStatusLog (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    OldStatus NVARCHAR(50) NOT NULL,
    NewStatus NVARCHAR(50) NOT NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ChangedBy NVARCHAR(100),
    FOREIGN KEY (OrderId) REFERENCES Orders(Id)
);
```

---

## 🎯 Use Cases

### Use Case 1: User xem lịch sử đơn hàng
```
1. User đăng nhập
2. Gọi GET /api/orders/my-orders
3. Click vào một đơn hàng
4. Gọi GET /api/orders/{orderId}/status-history
5. Hiển thị timeline lịch sử thay đổi trạng thái
```

### Use Case 2: Admin cập nhật trạng thái đơn hàng
```
1. Admin đăng nhập
2. Gọi GET /api/orders (lấy tất cả đơn)
3. Chọn đơn hàng cần cập nhật
4. Gọi PUT /api/orders/status với trạng thái mới
5. Hệ thống tự động:
   - Cập nhật Order.Status
   - Tạo OrderStatusLog mới
   - Trả về kết quả
```

### Use Case 3: User hủy đơn hàng
```
1. User xem đơn hàng của mình
2. Click "Hủy đơn"
3. Gọi PUT /api/orders/{id}/cancel
4. Hệ thống:
   - Kiểm tra có thể hủy không (status = Pending/AwaitingPayment)
   - Cập nhật status = Cancelled
   - Ghi log thay đổi
```

---

## 📁 Các Files Đã Tạo

### DTOs
- ✅ `Core/BookStore.Application/Dtos/Ordering/OrderStatusLogDto.cs`

### Repositories
- ✅ `Core/BookStore.Domain/IRepository/Ordering/IOrderStatusLogRepository.cs`
- ✅ `Core/BookStore.Infrastructure/Repositories/Ordering/OrderStatusLogRepository.cs`

### Mappers
- ✅ `Core/BookStore.Application/Mappers/Ordering/OrderStatusLogMapper.cs`

### Services
- ✅ Updated: `Core/BookStore.Application/IService/Ordering/IOrderService.cs`
- ✅ Updated: `Core/BookStore.Application/Services/Ordering/OrderService.cs`

### Controllers
- ✅ Updated: `Core/BookStore.API/Controllers/Order/OrdersController.cs`
  - Added endpoint: `GET /api/orders/{id}/status-history`

### Configuration
- ✅ Updated: `Core/BookStore.API/Program.cs` (Dependency Injection)

---

## 🧪 Testing

### Test với Swagger
1. Chạy ứng dụng: `dotnet run` hoặc F5
2. Mở Swagger UI: `http://localhost:5276/swagger`
3. Đăng nhập để lấy Bearer Token
4. Test các endpoints:
   - Tạo đơn hàng mới
   - Cập nhật trạng thái
   - Xem lịch sử thay đổi

### Test với Postman
```bash
# 1. Login
POST http://localhost:5276/api/auth/login
Body: { "email": "admin@bookstore.com", "password": "Admin@123" }

# 2. Get Order History
GET http://localhost:5276/api/orders/{orderId}/status-history
Headers: Authorization: Bearer {token}

# 3. Update Status (Admin only)
PUT http://localhost:5276/api/orders/status
Headers: Authorization: Bearer {admin_token}
Body: {
  "orderId": "...",
  "newStatus": "Shipped",
  "note": "Đang giao hàng"
}
```

---

## ✅ Hoàn thành Story 17

**Các chức năng đã implement:**
- ✅ API lấy lịch sử đơn hàng theo User
- ✅ API xem chi tiết đơn hàng (bao gồm cả lịch sử trong Story 14)
- ✅ API cập nhật trạng thái đơn hàng (Admin)
- ✅ Tự động ghi log khi thay đổi trạng thái
- ✅ Authorization: User chỉ xem được đơn của mình, Admin xem được tất cả
- ✅ Pagination cho danh sách đơn hàng

**Lưu ý quan trọng:**
- Mỗi lần cập nhật trạng thái đơn hàng, hệ thống tự động tạo record trong `OrderStatusLog`
- User chỉ có thể xem lịch sử của đơn hàng thuộc về mình
- Admin có thể xem và quản lý tất cả đơn hàng
