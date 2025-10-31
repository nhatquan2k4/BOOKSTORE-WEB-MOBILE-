# Hướng dẫn sử dụng UI Components trong Cart, Checkout, Book Detail

## 1. Import Components

Thêm vào đầu file:

```tsx
import { Button, Input, Badge, Card, Alert, EmptyState } from '@/components/ui';
```

## 2. Thay thế trong Cart Page (cart/page.tsx)

### Thay thế các buttons thông thường:

**CŨ:**
```tsx
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
  Thanh toán
</button>
```

**MỚI:**
```tsx
<Button variant="primary" size="lg">
  Thanh toán
</Button>
```

### Thay thế Input fields:

**CŨ:**
```tsx
<input
  type="text"
  value={voucherCode}
  onChange={(e) => setVoucherCode(e.target.value)}
  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
  placeholder="Nhập mã giảm giá"
/>
```

**MỚI:**
```tsx
<Input
  value={voucherCode}
  onChange={(e) => setVoucherCode(e.target.value)}
  placeholder="Nhập mã giảm giá"
  error={voucherError}
/>
```

### Thay thế Badge cho trạng thái:

**CŨ:**
```tsx
<span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
  Còn hàng
</span>
```

**MỚI:**
```tsx
<Badge variant="success">Còn hàng</Badge>
```

### Empty State khi giỏ hàng trống:

**CŨ:**
```tsx
<div className="text-center py-12">
  <h3 className="text-xl font-semibold">Giỏ hàng trống</h3>
  <p className="text-gray-500">Bạn chưa có sản phẩm nào</p>
  <Link href="/books">
    <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
      Mua sắm ngay
    </button>
  </Link>
</div>
```

**MỚI:**
```tsx
<EmptyState
  title="Giỏ hàng trống"
  description="Bạn chưa có sản phẩm nào trong giỏ hàng"
  action={{
    label: 'Mua sắm ngay',
    onClick: () => router.push('/books')
  }}
/>
```

## 3. Thay thế trong Checkout Page (checkout/page.tsx)

### Input fields trong form:

**CŨ:**
```tsx
<input
  type="text"
  name="fullName"
  value={formData.fullName}
  onChange={handleInputChange}
  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
  placeholder="Nhập họ và tên"
/>
```

**MỚI:**
```tsx
<Input
  name="fullName"
  value={formData.fullName}
  onChange={handleInputChange}
  placeholder="Nhập họ và tên"
  label="Họ và tên"
  required
/>
```

### Buttons:

**CŨ:**
```tsx
<button
  onClick={handlePlaceOrder}
  disabled={isProcessing}
  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl"
>
  {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
</button>
```

**MỚI:**
```tsx
<Button
  onClick={handlePlaceOrder}
  loading={isProcessing}
  variant="primary"
  size="lg"
  className="w-full"
>
  Đặt hàng
</Button>
```

### Alert messages:

**CŨ:**
```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
  <p className="text-xs text-amber-800">
    Mua thêm để được miễn phí vận chuyển
  </p>
</div>
```

**MỚI:**
```tsx
<Alert variant="warning">
  Mua thêm {(500000 - subtotal).toLocaleString('vi-VN')}₫ để được miễn phí vận chuyển
</Alert>
```

## 4. Thay thế trong Book Detail Page (books/[id]/page.tsx)

### Buttons:

**CŨ:**
```tsx
<button className="h-[40px] shrink-0 rounded-lg bg-blue-600 px-3 text-white">
  Gửi
</button>
```

**MỚI:**
```tsx
<Button variant="primary" size="sm">
  Gửi
</Button>
```

### Input trong comment section:

**CŨ:**
```tsx
<input
  value={replyDrafts[comment.id] ?? ""}
  onChange={(e) => updateReplyDraft(comment.id, e.target.value)}
  placeholder="Viết phản hồi…"
  className="h-[40px] flex-1 rounded-lg border border-gray-300 bg-white px-3"
/>
```

**MỚI:**
```tsx
<Input
  value={replyDrafts[comment.id] ?? ""}
  onChange={(e) => updateReplyDraft(comment.id, e.target.value)}
  placeholder="Viết phản hồi…"
/>
```

### Badge cho rating hoặc stock:

**CŨ:**
```tsx
<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
  Còn {stock} cuốn
</span>
```

**MỚI:**
```tsx
<Badge variant="success" size="sm">
  Còn {stock} cuốn
</Badge>
```

## 5. Các variant có sẵn:

### Button variants:
- `primary` - Blue button (default)
- `secondary` - Gray button
- `outline` - Outlined button
- `ghost` - Transparent button
- `danger` - Red button for delete actions

### Button sizes:
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

### Badge variants:
- `default` - Gray
- `success` - Green (stock, completed)
- `warning` - Yellow (processing, low stock)
- `danger` - Red (out of stock, cancelled)
- `info` - Blue (new, info)

### Alert variants:
- `info` - Blue (information)
- `success` - Green (success messages)
- `warning` - Yellow (warnings)
- `danger` - Red (errors)

## 6. Ví dụ tổng hợp:

```tsx
'use client';

import { Button, Input, Badge, Alert, EmptyState } from '@/components/ui';

export default function CartPage() {
  // ... state & logic
  
  return (
    <div>
      {/* Empty state */}
      {cartItems.length === 0 && (
        <EmptyState
          title="Giỏ hàng trống"
          action={{ label: 'Mua sắm ngay', onClick: () => router.push('/books') }}
        />
      )}
      
      {/* Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Badge */}
      <Badge variant="success">Còn hàng</Badge>
      
      {/* Input */}
      <Input
        label="Mã giảm giá"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        error={voucherError}
      />
      
      {/* Buttons */}
      <Button variant="outline" onClick={handleCancel}>
        Hủy
      </Button>
      <Button variant="primary" loading={isLoading} onClick={handleSubmit}>
        Xác nhận
      </Button>
    </div>
  );
}
```

## 7. Lưu ý:

- ✅ Components đã có border-radius: rounded-full (mềm mại)
- ✅ Components đã bỏ focus ring (outline khi click)
- ✅ Tất cả components đều responsive
- ✅ TypeScript full support
- ✅ Có thể override className nếu cần customize
