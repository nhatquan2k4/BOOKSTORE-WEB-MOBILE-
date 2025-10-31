# Hướng dẫn sử dụng Cart Store

## Tổng quan

File `cartStore.ts` cung cấp một Zustand store để quản lý giỏ hàng và đồng bộ dữ liệu giữa trang Cart và Checkout.

## Cài đặt Dependencies

```bash
npm install zustand
```

## Cấu trúc Store

### State
- `cartItems`: Danh sách sản phẩm trong giỏ
- `appliedVoucher`: Mã giảm giá đã áp dụng
- `checkoutData`: Dữ liệu đã chuẩn bị cho checkout

### Actions
- Cart management: `addToCart`, `removeFromCart`, `updateQuantity`, `toggleSelectItem`, `selectAll`, `clearCart`
- Voucher: `applyVoucher`, `removeVoucher`
- Checkout: `prepareCheckout`, `clearCheckout`
- Computed: `getSelectedItems`, `getSubtotal`, `getDiscount`, `getShippingFee`, `getTotal`

## Sử dụng trong Cart Page

```tsx
// src/app/(shop)/cart/page.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  
  // Get state and actions from store
  const cartItems = useCartStore((state) => state.cartItems);
  const appliedVoucher = useCartStore((state) => state.appliedVoucher);
  const setCartItems = useCartStore((state) => state.setCartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleSelectItem = useCartStore((state) => state.toggleSelectItem);
  const selectAll = useCartStore((state) => state.selectAll);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const applyVoucher = useCartStore((state) => state.applyVoucher);
  const removeVoucher = useCartStore((state) => state.removeVoucher);
  const prepareCheckout = useCartStore((state) => state.prepareCheckout);
  
  // Get computed values
  const getSelectedItems = useCartStore((state) => state.getSelectedItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscount = useCartStore((state) => state.getDiscount);
  const getShippingFee = useCartStore((state) => state.getShippingFee);
  const getTotal = useCartStore((state) => state.getTotal);

  // Load mock data on mount (replace with API call later)
  useEffect(() => {
    if (cartItems.length === 0) {
      setCartItems(MOCK_CART_ITEMS);
    }
  }, []);

  const selectedItems = getSelectedItems();
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const total = getTotal();

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
      return;
    }
    
    // Prepare checkout data and save to store
    prepareCheckout();
    
    // Navigate to checkout page
    router.push('/checkout');
  };

  return (
    // Your cart UI with selectedItems, subtotal, discount, etc.
  );
}
```

## Sử dụng trong Checkout Page

```tsx
// src/app/(shop)/checkout/page.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  
  // Get checkout data from store
  const checkoutData = useCartStore((state) => state.checkoutData);
  const clearCheckout = useCartStore((state) => state.clearCheckout);

  // Redirect if no checkout data
  useEffect(() => {
    if (!checkoutData || checkoutData.selectedItems.length === 0) {
      router.push('/cart');
    }
  }, [checkoutData, router]);

  if (!checkoutData) {
    return <div>Loading...</div>;
  }

  const {
    selectedItems,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedVoucher
  } = checkoutData;

  const handlePlaceOrder = async () => {
    // Call API to place order
    // ...
    
    // On success, clear checkout data and cart
    clearCheckout();
    
    // Navigate to success page
    router.push('/order/success');
  };

  return (
    <div>
      {/* Display order summary */}
      <div>
        <h2>Đơn hàng của bạn</h2>
        {selectedItems.map((item) => (
          <div key={item.id}>
            <p>{item.title}</p>
            <p>Số lượng: {item.quantity}</p>
            <p>Giá: {item.price * item.quantity}₫</p>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div>
        <p>Tạm tính: {subtotal}₫</p>
        {discount > 0 && <p>Giảm giá: -{discount}₫</p>}
        {appliedVoucher && <p>Mã giảm giá: {appliedVoucher.code}</p>}
        <p>Phí vận chuyển: {shippingFee}₫</p>
        <p>Tổng cộng: {total}₫</p>
      </div>

      <button onClick={handlePlaceOrder}>Đặt hàng</button>
    </div>
  );
}
```

## API Integration (Tương lai)

```tsx
// Thay thế mock data bằng API calls

// In Cart Page
useEffect(() => {
  const fetchCart = async () => {
    const response = await fetch('/api/cart');
    const data = await response.json();
    setCartItems(data.items);
  };
  fetchCart();
}, []);

// When updating cart
const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  await fetch(`/api/cart/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  });
  updateQuantity(itemId, quantity);
};

// In Checkout Page
const handlePlaceOrder = async () => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      items: checkoutData.selectedItems,
      voucher: checkoutData.appliedVoucher?.code,
      total: checkoutData.total
    })
  });
  
  if (response.ok) {
    clearCheckout();
    clearCart(); // Clear selected items
    router.push('/order/success');
  }
};
```

## Tính năng

✅ Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
✅ Chọn/bỏ chọn sản phẩm
✅ Áp dụng mã giảm giá
✅ Tính toán tự động: tạm tính, giảm giá, phí ship, tổng tiền
✅ Miễn phí ship cho đơn ≥ 500,000₫
✅ Lưu trữ vào localStorage (persist)
✅ Đồng bộ dữ liệu giữa Cart và Checkout
✅ Type-safe với TypeScript

## Lưu ý

- Store sử dụng `persist` middleware nên dữ liệu được lưu vào localStorage
- Checkout data chỉ tồn tại khi user chuyển từ cart sang checkout
- Sau khi đặt hàng thành công, nhớ gọi `clearCheckout()` và xóa items đã đặt khỏi cart
