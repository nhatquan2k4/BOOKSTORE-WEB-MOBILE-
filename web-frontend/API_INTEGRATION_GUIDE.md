# 🚀 Hướng dẫn tích hợp API vào giao diện

## 📋 Tổng quan

Đã tạo **34 service files** và các hooks/components để tích hợp API vào giao diện Next.js.

## 🎯 Các file đã tạo

### 1. **Custom Hooks** (`src/hooks/`)

#### `useBooks.ts` - Quản lý sách
```typescript
import { useFeaturedBooks, useBooks, useBook, useCategories } from '@/hooks';

// Lấy sách nổi bật
const { books, loading, error } = useFeaturedBooks(6);

// Lấy danh sách sách với filter
const { books, totalPages, totalCount, loading, error } = useBooks({
  page: 1,
  pageSize: 20,
  categoryId: 'category-id',
  search: 'keyword',
});

// Lấy chi tiết 1 sách
const { book, loading, error } = useBook(bookId);

// Lấy danh mục
const { categories, loading, error } = useCategories();
```

#### `useCart.ts` - Quản lý giỏ hàng
```typescript
import { useCart } from '@/hooks';

const {
  cart,           // { items, totalItems, totalPrice, selectedTotal }
  loading,
  error,
  addToCart,      // async (bookId, quantity) => boolean
  updateQuantity, // async (itemId, quantity) => void
  removeItem,     // async (itemId) => void
  clearCart,      // async () => void
  refreshCart,    // () => void
} = useCart();

// Thêm vào giỏ
await addToCart('book-id', 2);

// Cập nhật số lượng
await updateQuantity('cart-item-id', 3);

// Xóa khỏi giỏ
await removeItem('cart-item-id');
```

### 2. **Components** (`src/components/home/`)

#### `FeaturedBooks.tsx` - Hiển thị sách nổi bật
```tsx
import { FeaturedBooks } from '@/components/home/FeaturedBooks';

<FeaturedBooks limit={6} />
```

**Features:**
- ✅ Tự động fetch data từ API
- ✅ Loading skeleton
- ✅ Error handling
- ✅ Responsive design
- ✅ Hover effects
- ✅ Quick actions (Add to cart, Wishlist)

### 3. **Services** (`src/services/`)

Tất cả 34 services đã sẵn sàng sử dụng:

```typescript
import { 
  authService,
  bookService,
  cartService,
  orderService,
  categoryService,
  paymentService,
  // ... 28 services khác
} from '@/services';

// Sách
const books = await bookService.getBooks({ pageNumber: 1, pageSize: 10 });
const book = await bookService.getBookById('id');

// Giỏ hàng
const cart = await cartService.getUserCart('userId');
await cartService.addToCart('userId', { bookId: 'id', quantity: 1 });

// Đơn hàng
const orders = await orderService.getUserOrders('userId');
const order = await orderService.getOrderById('orderId');

// Thanh toán
await paymentService.createPayment({ orderId: 'id', amount: 100000 });
```

## 📝 Cách tích hợp vào trang

### ✅ Trang đã tích hợp sẵn

#### 1. **Login Page** (`app/(auth)/login/page.tsx`)
```tsx
"use client";
import { useAuth } from '@/contexts';

const { login } = useAuth();
await login({ email, password, rememberMe });
```

#### 2. **Register Page** (`app/(auth)/register/page.tsx`)  
Similar như login, sử dụng `authService.register()`

### 🔧 Trang cần tích hợp

#### 3. **Homepage** (`app/page.tsx`)

**Option 1: Sử dụng Component có sẵn**
```tsx
import { FeaturedBooks } from '@/components/home/FeaturedBooks';

export default function HomePage() {
  return (
    <div>
      {/* ... Hero section ... */}
      
      {/* Featured Books - TỰ ĐỘNG LOAD TỪ API */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Sách nổi bật</h2>
        <FeaturedBooks limit={6} />
      </section>
    </div>
  );
}
```

**Option 2: Sử dụng Hook**
```tsx
import { useFeaturedBooks, useCategories } from '@/hooks';

export default function HomePage() {
  const { books, loading } = useFeaturedBooks(6);
  const { categories } = useCategories();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

#### 4. **Books Listing Page** (`app/(shop)/books/page.tsx`)

```tsx
"use client";
import { useBooks } from '@/hooks';
import { useState } from 'react';

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const { books, totalPages, loading, error } = useBooks({
    page,
    pageSize: 20,
    categoryId,
    search,
  });

  return (
    <div>
      {/* Filters */}
      <div>
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
        />
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-4 gap-6">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination 
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

#### 5. **Cart Page** (`app/(shop)/cart/page.tsx`)

```tsx
"use client";
import { useCart } from '@/hooks';

export default function CartPage() {
  const { 
    cart, 
    loading, 
    updateQuantity, 
    removeItem 
  } = useCart();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Giỏ hàng ({cart.totalItems} sản phẩm)</h1>
      
      {cart.items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.cover} alt={item.title} />
          <h3>{item.title}</h3>
          <p>{item.author}</p>
          
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
          />
          
          <button onClick={() => removeItem(item.id)}>
            Xóa
          </button>
          
          <p>{item.price * item.quantity} đ</p>
        </div>
      ))}

      <div className="summary">
        <p>Tổng: {cart.totalPrice} đ</p>
        <button>Thanh toán</button>
      </div>
    </div>
  );
}
```

#### 6. **Book Detail Page** (`app/(shop)/books/[id]/page.tsx`)

```tsx
"use client";
import { useBook } from '@/hooks';
import { useCart } from '@/hooks';
import { useState } from 'react';

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const { book, loading, error } = useBook(params.id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (loading) return <div>Loading...</div>;
  if (error || !book) return <div>Không tìm thấy sách</div>;

  const handleAddToCart = async () => {
    const success = await addToCart(book.id, quantity);
    if (success) {
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <img src={book.cover} alt={book.title} className="w-full" />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{book.author}</p>
          
          {/* Rating */}
          {book.rating && (
            <div className="flex items-center gap-2 mb-4">
              <span>⭐ {book.rating}</span>
              <span>({book.reviewCount} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-blue-600">
              {book.price.toLocaleString()} đ
            </span>
            {book.originalPrice && (
              <span className="text-xl text-gray-400 line-through ml-3">
                {book.originalPrice.toLocaleString()} đ
              </span>
            )}
          </div>

          {/* Stock */}
          {book.stock && (
            <p className="mb-4">Còn {book.stock} cuốn</p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <label>Số lượng:</label>
            <input
              type="number"
              min="1"
              max={book.stock || 99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 px-3 py-2 border rounded"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thêm vào giỏ
            </button>
            <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Mua ngay
            </button>
          </div>

          {/* Description */}
          {book.description && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
              <p className="text-gray-700">{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 7. **Checkout Page** (`app/(shop)/checkout/page.tsx`)

```tsx
"use client";
import { useCart } from '@/hooks';
import { checkoutService, paymentService } from '@/services';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Create order
      const order = await checkoutService.createOrder({
        items: cart.items.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipientName: shippingInfo.name,
          phoneNumber: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
        },
        paymentMethod: 'VNPAY', // or 'COD'
        note: shippingInfo.note,
      });

      // 2. Create payment if needed
      if (order.paymentMethod === 'VNPAY') {
        const payment = await paymentService.createPayment({
          orderId: order.id,
          amount: cart.totalPrice,
          provider: 'VNPAY',
        });

        // Redirect to payment gateway
        if (payment.paymentUrl) {
          window.location.href = payment.paymentUrl;
          return;
        }
      }

      // 3. Success - redirect to order page
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Họ tên"
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Thành phố"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                className="w-full px-4 py-2 border rounded"
              />
              <textarea
                placeholder="Ghi chú"
                value={shippingInfo.note}
                onChange={(e) => setShippingInfo({...shippingInfo, note: e.target.value})}
                className="w-full px-4 py-2 border rounded"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg p-6 shadow sticky top-4">
            <h2 className="text-xl font-bold mb-4">Đơn hàng ({cart.totalItems} sản phẩm)</h2>
            
            <div className="space-y-3 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.cover} alt={item.title} className="w-16 h-20 object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-medium">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{cart.totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>30,000đ</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{(cart.totalPrice + 30000).toLocaleString()}đ</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cart.items.length === 0}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔑 Các API quan trọng

### Authentication
```typescript
// Login
await authService.login({ email, password, rememberMe });

// Register
await authService.register({ email, password, fullName, phoneNumber });

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();
```

### Books
```typescript
// Get all books
const books = await bookService.getBooks({
  pageNumber: 1,
  pageSize: 20,
  searchTerm: 'keyword',
  categoryId: 'id',
});

// Get book detail
const book = await bookService.getBookById('id');
```

### Cart
```typescript
// Get cart
const cart = await cartService.getUserCart('userId');

// Add to cart
await cartService.addToCart('userId', { bookId: 'id', quantity: 1 });

// Update quantity
await cartService.updateCartItem('userId', 'itemId', { quantity: 2 });

// Remove from cart
await cartService.removeFromCart('userId', 'itemId');

// Clear cart
await cartService.clearCart('userId');
```

### Orders
```typescript
// Get user orders
const orders = await orderService.getUserOrders('userId');

// Get order detail
const order = await orderService.getOrderById('orderId');

// Cancel order
await orderService.cancelOrder('orderId');
```

### Payment
```typescript
// Create payment
const payment = await paymentService.createPayment({
  orderId: 'id',
  amount: 100000,
  provider: 'VNPAY',
});

// Check payment status
const status = await paymentService.getPaymentById('paymentId');
```

## ⚠️ Lưu ý quan trọng

### 1. **Xử lý lỗi**
```typescript
try {
  const data = await bookService.getBooks();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Show error message to user
}
```

### 2. **Loading states**
Always show loading indicator khi fetch data:
```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataDisplay data={data} />;
```

### 3. **Authentication Required**
Một số API cần authentication. Check trước khi gọi:
```typescript
import { useAuth } from '@/contexts';

const { user, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  router.push('/login');
  return;
}

// Proceed with API call
```

### 4. **Environment Variables**
Đảm bảo `.env.local` có:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📦 Checklist tích hợp

- [x] ✅ Tạo 34 service files
- [x] ✅ Tạo custom hooks (useBooks, useCart)
- [x] ✅ Tạo FeaturedBooks component
- [x] ✅ Tích hợp Login/Register (đã có)
- [ ] 🔲 Tích hợp Homepage
- [ ] 🔲 Tích hợp Books Listing
- [ ] 🔲 Tích hợp Book Detail
- [ ] 🔲 Tích hợp Cart
- [ ] 🔲 Tích hợp Checkout
- [ ] 🔲 Tích hợp Orders
- [ ] 🔲 Tích hợp User Profile

## 🚀 Next Steps

1. **Test API connection**: Kiểm tra API backend đang chạy
2. **Update Homepage**: Thêm `<FeaturedBooks />` component
3. **Implement Cart**: Tích hợp useCart hook
4. **Add Error Boundaries**: Xử lý lỗi global
5. **Add Loading States**: Skeleton loaders
6. **Optimize Images**: Next.js Image component
7. **Add SEO**: Metadata cho từng trang

## 📚 Tài liệu tham khảo

- **Services**: `src/services/SERVICE_LIST.md`
- **Types**: `src/types/dtos/`
- **Hooks**: `src/hooks/`
- **Components**: `src/components/home/`

---

**Đã sẵn sàng để tích hợp! 🎉**
