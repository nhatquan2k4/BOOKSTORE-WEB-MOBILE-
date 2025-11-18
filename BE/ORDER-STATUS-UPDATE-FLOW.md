# 📦 Hướng Dẫn Cập Nhật Trạng Thái Đơn Hàng (Shipped → Completed)

## 🎯 Flow Sau Khi Payment Callback Thành Công

```
Payment Callback Success
        ↓
Order Status: Paid ✅
        ↓
Admin/Shipper gửi hàng
        ↓
PUT /api/orders/status { "newStatus": "Shipped" }
        ↓
Order Status: Shipped 🚚
        ↓
User nhận hàng
        ↓
PUT /api/orders/status { "newStatus": "Completed" }
        ↓
Order Status: Completed ✅
        ↓
OrderStatusLog: TỰ ĐỘNG tạo log cho mỗi lần chuyển trạng thái
```

---

## 📝 API Update Order Status

### **Endpoint:**
```http
PUT /api/orders/status
Authorization: Bearer {token}
Content-Type: application/json
```

### **Request Body:**
```json
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Shipped",  // hoặc "Completed", "Cancelled"
  "note": "Đã giao hàng cho đơn vị vận chuyển"
}
```

### **Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "orderNumber": "ORD-20251118-001",
  "status": "Shipped",
  "paidAt": "2025-11-18T10:09:08Z",
  "shippedAt": "2025-11-18T15:30:00Z",
  "completedAt": null,
  ...
}
```

---

## 🔄 Các Bước Chi Tiết

### **Bước 1: Sau Payment Callback → Order Status = "Paid"**

```
✅ Payment callback thành công
✅ Order status tự động chuyển từ "AwaitingPayment" → "Paid"
✅ OrderStatusLog tự động ghi: AwaitingPayment → Paid
```

---

### **Bước 2: Admin/Shipper Gửi Hàng → Update Status "Shipped"**

#### **Request:**
```http
PUT /api/orders/status
Authorization: Bearer {admin_token}

Body:
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Shipped",
  "note": "Đã giao cho GHTK - Mã vận đơn: GHTK123456"
}
```

#### **Kết quả:**
- ✅ Order status: `Paid` → `Shipped`
- ✅ Order.ShippedAt = DateTime.UtcNow
- ✅ **OrderStatusLog TỰ ĐỘNG tạo:**
  ```
  OldStatus: "Paid"
  NewStatus: "Shipped"
  ChangedBy: "Admin" hoặc note
  ChangedAt: 2025-11-18 15:30:00
  ```

---

### **Bước 3: User Nhận Hàng → Update Status "Completed"**

#### **Request:**
```http
PUT /api/orders/status
Authorization: Bearer {admin_token}

Body:
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Completed",
  "note": "Khách hàng đã nhận hàng và xác nhận"
}
```

#### **Kết quả:**
- ✅ Order status: `Shipped` → `Completed`
- ✅ Order.CompletedAt = DateTime.UtcNow
- ✅ **OrderStatusLog TỰ ĐỘNG tạo:**
  ```
  OldStatus: "Shipped"
  NewStatus: "Completed"
  ChangedBy: "Admin" hoặc note
  ChangedAt: 2025-11-18 17:00:00
  ```

---

## 📊 Timeline Đầy Đủ

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Payment Callback Thành Công                              │
│    POST /api/Checkout/payment-callback                      │
│    ↓                                                         │
│    Order Status: AwaitingPayment → Paid                     │
│    OrderStatusLog: [AwaitingPayment → Paid]                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Admin Chuẩn Bị Hàng & Gửi Shipper                        │
│    - Admin/Warehouse đóng gói hàng                           │
│    - Tạo mã vận đơn với đơn vị vận chuyển                    │
│    - Giao hàng cho shipper                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin Cập Nhật Status "Shipped"                          │
│    PUT /api/orders/status                                   │
│    Body: { orderId, newStatus: "Shipped", note: "..." }     │
│    ↓                                                         │
│    Order Status: Paid → Shipped                             │
│    Order.ShippedAt = now                                    │
│    OrderStatusLog: [Paid → Shipped]                         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Shipper Giao Hàng                                        │
│    - Shipper giao hàng cho khách                             │
│    - User nhận và kiểm tra hàng                              │
│    - User xác nhận đã nhận                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Admin/System Cập Nhật Status "Completed"                 │
│    PUT /api/orders/status                                   │
│    Body: { orderId, newStatus: "Completed", note: "..." }   │
│    ↓                                                         │
│    Order Status: Shipped → Completed                        │
│    Order.CompletedAt = now                                  │
│    OrderStatusLog: [Shipped → Completed]                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. User Xem Lịch Sử Đơn Hàng                                │
│    GET /api/orders/{orderId}/status-history                 │
│    ↓                                                         │
│    Response:                                                │
│    [                                                        │
│      { oldStatus: null, newStatus: "Pending", ... },        │
│      { oldStatus: "Pending", newStatus: "AwaitingPayment" },│
│      { oldStatus: "AwaitingPayment", newStatus: "Paid" },   │
│      { oldStatus: "Paid", newStatus: "Shipped" },           │
│      { oldStatus: "Shipped", newStatus: "Completed" }       │
│    ]                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Tất Cả Trạng Thái Có Thể

```
Pending           → Đơn hàng mới tạo
  ↓
AwaitingPayment   → Chờ thanh toán
  ↓
Paid              → Đã thanh toán ✅
  ↓
Processing        → (Optional) Đang xử lý/đóng gói
  ↓
Shipped           → Đã giao cho shipper 🚚
  ↓
Completed         → Hoàn thành ✅
```

**Trạng thái đặc biệt:**
- `Cancelled` → Đơn hàng bị hủy (có thể hủy ở bất kỳ bước nào trước Shipped)
- `Refunded` → Đã hoàn tiền

---

## 🧪 Test Flow Đầy Đủ

### **Bước 1: Checkout**
```http
POST /api/Checkout/process
Authorization: Bearer {user_token}

Body: { address, paymentMethod: "Online" }

Response:
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "payment": {
    "transactionCode": "ORD-20251118-239752"
  }
}
```

---

### **Bước 2: Payment Callback (Giả lập)**
```http
POST /api/Checkout/payment-callback

Body:
{
  "transactionCode": "ORD-20251118-239752",
  "status": "Success",
  "amount": 25000,
  "paidAt": "2025-11-18T10:09:08.7727"
}

Response: Order status = "Paid" ✅
```

---

### **Bước 3: Admin Gửi Hàng**
```http
PUT /api/orders/status
Authorization: Bearer {admin_token}

Body:
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Shipped",
  "note": "Đã giao cho GHTK - Mã vận đơn: GHTK123456"
}

Response: Order status = "Shipped" 🚚
```

---

### **Bước 4: User Nhận Hàng → Admin Hoàn Thành**
```http
PUT /api/orders/status
Authorization: Bearer {admin_token}

Body:
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Completed",
  "note": "Khách đã nhận hàng thành công"
}

Response: Order status = "Completed" ✅
```

---

### **Bước 5: Xem Lịch Sử**
```http
GET /api/orders/3fa85f64-5717-4562-b3fc-2c963f66afa6/status-history
Authorization: Bearer {user_token}

Response:
[
  {
    "id": "...",
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20251118-001",
    "oldStatus": "AwaitingPayment",
    "newStatus": "Paid",
    "changedAt": "2025-11-18T10:09:08Z",
    "changedBy": "System"
  },
  {
    "id": "...",
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20251118-001",
    "oldStatus": "Paid",
    "newStatus": "Shipped",
    "changedAt": "2025-11-18T15:30:00Z",
    "changedBy": "Đã giao cho GHTK - Mã vận đơn: GHTK123456"
  },
  {
    "id": "...",
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20251118-001",
    "oldStatus": "Shipped",
    "newStatus": "Completed",
    "changedAt": "2025-11-18T17:00:00Z",
    "changedBy": "Khách đã nhận hàng thành công"
  }
]
```

---

## 💡 Lưu Ý Quan Trọng

### **1. Authorization:**
- API `PUT /api/orders/status` **hiện tại đang comment authorization**
- Nên bật lại: `[Authorize(Roles = "Admin,Shipper")]`
- Chỉ Admin hoặc Shipper mới được cập nhật status

### **2. Auto-Logging:**
- **MỌI thay đổi status** đều tự động tạo OrderStatusLog
- Không cần gọi thủ công
- Log được tạo trong `OrderRepository.UpdateOrderStatusAsync()`

### **3. Timestamp Auto-Update:**
```csharp
// OrderRepository.UpdateOrderStatusAsync()
if (newStatus == "Paid") 
    order.PaidAt = DateTime.UtcNow;
    
if (newStatus == "Shipped") 
    order.ShippedAt = DateTime.UtcNow;
    
if (newStatus == "Completed") 
    order.CompletedAt = DateTime.UtcNow;
```

### **4. Note Field:**
- Field `note` trong request → Lưu vào `OrderStatusLog.ChangedBy`
- Nên ghi rõ: "Admin - Mã vận đơn: XXX" hoặc "System"

### **5. Validation:**
- Không thể chuyển từ `Completed` → `Shipped` (ngược lại)
- Không thể chuyển từ `Cancelled` sang trạng thái khác
- Nên thêm validation trong `OrderService.UpdateOrderStatusAsync()`

---

## 🔐 Cải Thiện Authorization

### **Hiện tại:**
```csharp
[HttpPut("status")]
// [Authorize(Roles = "Admin")]  ← Đang comment
public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusDto dto)
```

### **Nên sửa thành:**
```csharp
[HttpPut("status")]
[Authorize(Roles = "Admin,Shipper")]
public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusDto dto)
{
    // Thêm check: Shipper chỉ được update sang "Shipped" hoặc "Completed"
    var currentUser = User;
    if (currentUser.IsInRole("Shipper"))
    {
        if (dto.NewStatus != "Shipped" && dto.NewStatus != "Completed")
        {
            return Forbid("Shipper chỉ được cập nhật trạng thái Shipped hoặc Completed");
        }
    }
    
    var order = await _orderService.UpdateOrderStatusAsync(dto);
    return Ok(order);
}
```

---

## ✅ Summary

**Sau Payment Callback thành công:**

1. **Order Status = "Paid"** ✅
2. **Admin gửi hàng:**
   - `PUT /api/orders/status`
   - `{ orderId, newStatus: "Shipped" }`
3. **User nhận hàng:**
   - `PUT /api/orders/status`
   - `{ orderId, newStatus: "Completed" }`
4. **OrderStatusLog tự động ghi mọi thay đổi** ✅
5. **User xem lịch sử:**
   - `GET /api/orders/{id}/status-history`

**API duy nhất để update status:** `PUT /api/orders/status` 🎯
