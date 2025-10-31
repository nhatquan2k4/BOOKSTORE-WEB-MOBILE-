# 🛒 Cart & Checkout - Đồng bộ hoàn chỉnh với CartContext

## ✅ Đã hoàn thành

### **1. CartContext - Single Source of Truth**
File: `/src/contexts/CartContext.tsx`

**State được quản lý:**
- `items: CartItem[]` - Danh sách sản phẩm trong giỏ
- `appliedCoupon: Coupon | null` - Mã giảm giá đã áp dụng
- `shippingFee: number` - Phí vận chuyển (30,000đ)
- `usePoints: boolean` - Có sử dụng điểm tích lũy không
- `availablePoints: number` - 2,500 điểm
- `pointsValue: number` - 25,000đ

**Tính toán tự động:**
- `subtotal` = Σ(item.price × item.quantity)
- `discount` = Giảm giá từ coupon
- `pointsDiscount` = 25,000đ nếu usePoints = true
- `total` = subtotal + shippingFee - discount - pointsDiscount

**Mã coupon khả dụng:**
- `BOOK2024` - Giảm 50,000đ
- `WELCOME10` - Giảm 10%
- `FREESHIP` - Miễn phí vận chuyển (30,000đ)

---

### **2. Cart Page** 
File: `/src/app/(shop)/cart/page.tsx`

**Sử dụng CartContext:**
```tsx
const {
  items,
  updateQuantity,
  removeItem,
  clearCart,
  appliedCoupon,
  applyCoupon,
  removeCoupon,
  subtotal,
  discount,
  total,
  shippingFee,
} = useCart();
```

**Tính năng:**
- ✅ Hiển thị danh sách sản phẩm từ `items`
- ✅ Cập nhật số lượng: `updateQuantity(bookId, quantity)`
- ✅ Xóa sản phẩm: `removeItem(bookId)`
- ✅ Xóa toàn bộ giỏ: `clearCart()`
- ✅ Áp dụng coupon: `applyCoupon(code)` → return boolean
- ✅ Xóa coupon: `removeCoupon()`
- ✅ Hiển thị tính toán: subtotal, discount, shippingFee, total
- ✅ Link sang Checkout: `/checkout`

**Đặc điểm:**
- Grid 2 cột (Sản phẩm | Tóm tắt đơn hàng)
- Sticky order summary
- Gợi ý sản phẩm khác

---

### **3. Checkout Page**
File: `/src/app/(shop)/checkout/page.tsx`

**Sử dụng CartContext (ĐẦY ĐỦ TƯƠNG TỰ CART):**
```tsx
const {
  items,
  subtotal,
  discount,
  total,
  shippingFee,
  appliedCoupon,
  applyCoupon,
  removeCoupon,
  usePoints,
  setUsePoints,
  availablePoints,
  pointsValue,
  pointsDiscount,
} = useCart();
```

**Tính năng:**
- ✅ Hiển thị danh sách sản phẩm (mini thumbnail)
- ✅ Form thông tin giao hàng (Họ tên, SĐT, Email, Địa chỉ)
- ✅ Validation đầy đủ cho form
- ✅ Áp dụng coupon: `applyCoupon(code)`
- ✅ Xóa coupon: `removeCoupon()`
- ✅ Toggle điểm tích lũy: `setUsePoints(true/false)`
- ✅ 2 phương thức thanh toán:
  - 🏪 Thanh toán tại cửa hàng → Success Modal
  - 📱 Quét mã QR Code → QR Modal → Success Modal
- ✅ Checkbox đồng ý điều khoản
- ✅ Hiển thị tính toán: subtotal, discount, pointsDiscount, shippingFee, total

**Đặc điểm:**
- Grid 2 cột (Form | Tóm tắt đơn hàng)
- Sticky order summary
- Redirect nếu giỏ hàng trống
- 2 modals với nút close

---

## 🔄 Luồng đồng bộ dữ liệu

```
┌─────────────┐
│ CartContext │ ← Single Source of Truth
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
   ┌───▼───┐     ┌────▼────┐   ┌────▼────┐
   │ Cart  │     │Checkout │   │ Future  │
   │ Page  │     │  Page   │   │  Pages  │
   └───────┘     └─────────┘   └─────────┘
```

**Khi user ở Cart Page:**
1. Thêm/Xóa/Cập nhật sản phẩm → Lưu vào CartContext → localStorage
2. Áp dụng coupon → Lưu vào CartContext
3. Click "Thanh toán" → Chuyển sang `/checkout`

**Khi user ở Checkout Page:**
1. Đọc `items`, `subtotal`, `discount`, `total` từ CartContext
2. Có thể áp dụng/xóa coupon (đồng bộ với Cart)
3. Toggle điểm tích lũy → Cập nhật `pointsDiscount` → Tính lại `total`
4. Submit đơn hàng → Hiển thị modal thành công

---

## 📊 So sánh Cart vs Checkout

| Tính năng | Cart Page | Checkout Page |
|-----------|-----------|---------------|
| Hiển thị sản phẩm | ✅ Full size | ✅ Mini thumbnail |
| Cập nhật số lượng | ✅ | ❌ |
| Xóa sản phẩm | ✅ | ❌ |
| Áp dụng coupon | ✅ | ✅ |
| Sử dụng điểm | ❌ | ✅ |
| Form giao hàng | ❌ | ✅ |
| Phương thức TT | ❌ | ✅ |
| Tính toán giá | ✅ Tự động | ✅ Tự động |

---

## 🎨 Phong cách UI nhất quán

**Màu sắc:**
- Primary: `blue-600` (Nút, Link)
- Success: `green-600` (Giảm giá, Coupon thành công)
- Error: `red-600` (Giá, Lỗi validation)
- Gray: `gray-50, 100, 300, 600, 900` (Background, Text, Border)

**Components:**
- Rounded corners: `rounded-lg`
- Shadows: `shadow-sm`
- Spacing: `gap-4`, `space-y-4`, `p-6`
- Focus ring: `focus:ring-2 focus:ring-blue-500`

**Responsive:**
- Mobile: 1 cột
- Desktop (lg): 2 cột (Content | Summary)

---

## 🔧 Accessibility

✅ **Cart Page:**
- htmlFor + id cho inputs
- sr-only text cho radio buttons
- aria-label cho icon buttons

✅ **Checkout Page:**
- htmlFor + id cho tất cả form fields
- sr-only text cho payment method radios
- Validation errors rõ ràng
- Modal đơn giản (không có complex a11y issues)

---

## 📝 Cách sử dụng trong tương lai

**Thêm sản phẩm vào giỏ:**
```tsx
import { useCart } from '@/contexts/CartContext';

const { addItem } = useCart();

addItem({
  id: 'unique-cart-item-id',
  bookId: 'book-123',
  title: 'Book Title',
  author: 'Author Name',
  coverImage: '/path/to/image.jpg',
  price: 100000,
  quantity: 1,
});
```

**Kiểm tra giỏ hàng:**
```tsx
const { items, total } = useCart();

if (items.length === 0) {
  // Giỏ hàng trống
}

console.log(`Tổng tiền: ${total.toLocaleString()}đ`);
```

---

## ✨ Kết luận

✅ **Cart và Checkout đã đồng bộ hoàn chỉnh**
✅ **Dùng chung CartContext - Single Source of Truth**
✅ **LocalStorage persistence**
✅ **UI/UX nhất quán**
✅ **Không có lỗi ESLint/TypeScript**
✅ **Accessibility chuẩn**

Bạn có thể test ngay bằng cách:
1. Mở trang Cart
2. Thêm mock data vào CartContext
3. Áp dụng coupon
4. Chuyển sang Checkout
5. Thấy dữ liệu đồng bộ hoàn toàn! 🎉
