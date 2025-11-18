# 🔄 Flow Payment Callback & Order Status Update

## 📝 Khi call back thì cập nhật trạng thái gì?

### **Trả lời:** Khi payment callback được gọi, hệ thống sẽ cập nhật:

```
Payment Status: Success/Failed
        ↓
Order Status: AwaitingPayment → Paid (nếu thành công)
        ↓
OrderStatusLog: TỰ ĐỘNG tạo record ghi lại thay đổi
```

---

## 🎯 Flow Chi Tiết

### **1. User Checkout**
```http
POST /api/Checkout/process

Body:
{
  "address": {...},
  "couponCode": "DISCOUNT10",
  "paymentMethod": "Online"
}
```

**Kết quả:**
- ✅ Tạo Order với status: `Pending` hoặc `AwaitingPayment`
- ✅ Tạo PaymentTransaction với status: `Pending`
- ✅ Tạo QR code thanh toán
- ✅ Reserve stock (giữ hàng)
- ✅ **Tạo OrderStatusLog đầu tiên:** `null → Pending`

---

### **2. User Thanh Toán → Payment Gateway Callback**

User quét QR code và thanh toán → **Payment Gateway gọi webhook:**

```http
POST /api/Checkout/payment-callback
Authorization: None (AllowAnonymous)

Body:
{
  "transactionCode": "ORD-20251118-239752",
  "status": "Success",  // hoặc "Failed", "Cancelled", "Completed"
  "amount": 25000,
  "paidAt": "2025-11-18T10:09:08.7727",
  "message": "không"
}
```

**⚠️ LƯU Ý:** 
- **KHÔNG CÓ `orderId`** trong request body!
- Hệ thống sẽ tự động tìm Order thông qua `transactionCode`
- `transactionCode` chính là mã giao dịch được tạo khi checkout

---

### **3. Hệ Thống Xử Lý Callback**

#### **🔍 Flow Tra Cứu OrderId:**

```
transactionCode: "ORD-20251118-239752"
        ↓
PaymentService.ProcessPaymentCallbackAsync()
        ↓
PaymentRepository.GetByTransactionCodeAsync(transactionCode)
        ↓
PaymentTransaction { OrderId: "3fa85f64-...", ... }
        ↓
Tìm được OrderId! ✅
```

#### **File:** `CheckoutService.cs` → `HandlePaymentCallbackAsync()`

```csharp
public async Task<CheckoutResultDto> HandlePaymentCallbackAsync(PaymentCallbackDto callbackDto)
{
    // 1. Tra cứu PaymentTransaction qua transactionCode và cập nhật status
    var payment = await _paymentService.ProcessPaymentCallbackAsync(callbackDto);
    // ↓ ProcessPaymentCallbackAsync làm gì:
    //   - Tìm payment qua: GetByTransactionCodeAsync(dto.TransactionCode)
    //   - Cập nhật status: Pending → Success/Failed
    //   - Trả về payment với OrderId
    
    // 2. Lấy Order thông qua payment.OrderId
    var order = await _orderService.GetOrderByIdAsync(payment.OrderId);
    
    // 3. Kiểm tra status từ callback
    if (callbackDto.Status == "Success" || callbackDto.Status == "Completed")
    {
        // ✅ THANH TOÁN THÀNH CÔNG
        
        // 3a. Cập nhật Order status: AwaitingPayment → Paid
        await _orderService.ConfirmOrderPaymentAsync(payment.OrderId);
        
        // 3b. Confirm stock sale (chuyển từ reserved sang sold)
        await ConfirmStockSaleAsync(order);
    }
    else if (callbackDto.Status == "Failed" || callbackDto.Status == "Cancelled")
    {
        // ❌ THANH TOÁN THẤT BẠI
        
        // Release reserved stock (trả lại hàng)
        await ReleaseStockForCartAsync(order);
    }
    
    return order.ToCheckoutResultDto(payment);
}
```

---

### **4. Cập Nhật Order Status**

#### **File:** `OrderService.cs` → `ConfirmOrderPaymentAsync()`

```csharp
public async Task<OrderDto> ConfirmOrderPaymentAsync(Guid orderId)
{
    // Cập nhật status sang "Paid"
    await _orderRepository.UpdateOrderStatusAsync(orderId, "Paid", "Payment confirmed");
    await _orderRepository.SaveChangesAsync();
    
    return MapToOrderDto(order);
}
```

---

### **5. TỰ ĐỘNG Tạo OrderStatusLog**

#### **File:** `OrderRepository.cs` → `UpdateOrderStatusAsync()`

```csharp
public async Task UpdateOrderStatusAsync(Guid orderId, string newStatus, string? note = null)
{
    var order = await GetByIdAsync(orderId);
    var oldStatus = order.Status;
    
    // Chỉ tạo log nếu status thực sự thay đổi
    if (oldStatus != newStatus)
    {
        // Cập nhật Order status
        order.Status = newStatus;
        
        // Cập nhật timestamp
        if (newStatus == "Paid") 
            order.PaidAt = DateTime.UtcNow;
        
        Update(order);
        
        // ✅ TỰ ĐỘNG TẠO LOG
        await _statusLogRepository.CreateLogAsync(
            orderId,
            oldStatus,      // "AwaitingPayment"
            newStatus,      // "Paid"
            note ?? "System"  // "Payment confirmed"
        );
    }
}
```

**Kết quả trong database:**
```sql
INSERT INTO OrderStatusLog (Id, OrderId, OldStatus, NewStatus, ChangedAt, ChangedBy)
VALUES (
    '...', 
    'order-id', 
    'AwaitingPayment',  -- Trạng thái cũ
    'Paid',             -- Trạng thái mới
    '2024-11-18 10:30:00',
    'System'            -- Hoặc note từ callback
);
```

---

## 📊 Timeline Đầy Đủ

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Checkout                                            │
│    POST /api/Checkout/process                               │
│    ↓                                                         │
│    Order: status = "Pending" hoặc "AwaitingPayment"         │
│    PaymentTransaction: status = "Pending"                   │
│    OrderStatusLog: null → "AwaitingPayment"                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User Thanh Toán                                          │
│    Quét QR code / Chuyển khoản                              │
│    ↓                                                         │
│    Payment Gateway nhận tiền                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Payment Gateway Callback                                 │
│    POST /api/Checkout/payment-callback                      │
│    Body: { status: "Success", transactionCode: "..." }      │
│    ↓                                                         │
│    HandlePaymentCallbackAsync() được gọi                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Update Order & Payment Status                            │
│    PaymentTransaction: Pending → Paid                       │
│    Order: AwaitingPayment → Paid                            │
│    ↓                                                         │
│    ✅ TỰ ĐỘNG TẠO OrderStatusLog:                           │
│       OldStatus: "AwaitingPayment"                          │
│       NewStatus: "Paid"                                     │
│       ChangedBy: "System"                                   │
│       ChangedAt: 2024-11-18 10:30:00                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Confirm Stock Sale                                       │
│    Reserved Stock → Sold                                    │
│    ✅ Ghi log vào InventoryTransaction                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. User Xem Lịch Sử                                         │
│    GET /api/orders/{orderId}/status-history                 │
│    ↓                                                         │
│    Response:                                                │
│    [                                                        │
│      {                                                      │
│        oldStatus: "AwaitingPayment",                        │
│        newStatus: "Paid",                                   │
│        changedAt: "2024-11-18T10:30:00Z",                   │
│        changedBy: "System"                                  │
│      }                                                      │
│    ]                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Các Trạng Thái Có Thể

### **Payment Callback Status:**
- `Success` / `Completed` → Cập nhật Order thành `Paid`
- `Failed` → Giữ nguyên `AwaitingPayment`, release stock
- `Cancelled` → Giữ nguyên hoặc hủy order, release stock

### **Order Status Flow:**
```
Pending 
  ↓ (sau checkout)
AwaitingPayment
  ↓ (sau callback thành công)
Paid
  ↓ (admin xử lý)
Shipped
  ↓ (user nhận hàng)
Completed
```

**Mỗi lần chuyển status → TỰ ĐỘNG tạo OrderStatusLog** ✅

---

## 💡 Điểm Quan Trọng

1. **OrderStatusLog được tạo TỰ ĐỘNG** mỗi khi `UpdateOrderStatusAsync()` được gọi
2. **Không cần gọi thủ công** từ service layer
3. **Luôn ghi lại:** oldStatus, newStatus, changedAt, changedBy
4. **Payment callback** là trigger chính để chuyển `AwaitingPayment` → `Paid`
5. **Stock được confirm** ngay sau khi thanh toán thành công

---

## 🧪 Test Flow

### **Bước 1: Checkout và lấy transactionCode**
```http
POST /api/Checkout/process

Response:
{
  "success": true,
  "orderId": "3fa85f64-...",
  "payment": {
    "transactionCode": "ORD-20251118-239752",  ← LƯU LẠI MÃ NÀY
    "amount": 25000,
    "qrCodeUrl": "..."
  }
}
```

### **Bước 2: Fake callback (test) - CHỈ CẦN transactionCode**
```http
POST /api/Checkout/payment-callback

Body:
{
  "transactionCode": "ORD-20251118-239752",  ← Dùng mã từ bước 1
  "status": "Success",
  "amount": 25000,
  "paidAt": "2025-11-18T10:09:08.7727",
  "message": "không"
}
```

**⚠️ KHÔNG CẦN `orderId`!** Hệ thống tự động tìm qua `transactionCode`.

### **Bước 3: Xem lịch sử**
```http
GET /api/orders/{orderId}/status-history

Response:
[
  {
    "oldStatus": "AwaitingPayment",
    "newStatus": "Paid",
    "changedAt": "2025-11-18T10:09:08Z",
    "changedBy": "System"
  }
]
```

---

## ✅ Summary

**Khi callback:**
1. Payment status: `Pending` → `Paid`
2. Order status: `AwaitingPayment` → `Paid`
3. **OrderStatusLog: TỰ ĐỘNG tạo** ✅
4. Stock: Reserved → Sold
5. Inventory transaction: TỰ ĐỘNG ghi

**Tất cả diễn ra tự động, không cần can thiệp thủ công!** 🎉

---

## 📦 Sau Callback → Gửi Hàng & Hoàn Thành

Sau khi callback thành công (Order = "Paid"), để gửi hàng và hoàn thành đơn:

### **API Update Order Status:**
```http
PUT /api/orders/status
Authorization: Bearer {admin_token}

Body:
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "Shipped",  // hoặc "Completed"
  "note": "Đã giao cho GHTK - Mã vận đơn: GHTK123456"
}
```

### **Flow:**
```
Paid → Admin gửi hàng → PUT /api/orders/status { newStatus: "Shipped" }
     → Shipped → User nhận hàng → PUT /api/orders/status { newStatus: "Completed" }
     → Completed ✅
```

**📖 Xem chi tiết:** [ORDER-STATUS-UPDATE-FLOW.md](./ORDER-STATUS-UPDATE-FLOW.md)
