"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { Button, Input, Badge, EmptyState, Alert } from "@/components/ui";

type CartItem = {
  id: string;
  bookId: string;
  title: string;
  author: string;
  cover: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  selected: boolean;
};

type Voucher = {
  code: string;
  discount: number; // percentage
  minOrder: number;
  maxDiscount: number;
};

// ============================================================================
// MOCK DATA - XÓA TOÀN BỘ SECTION NÀY KHI NỐI API THẬT
// ============================================================================
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: "cart-1",
    bookId: "1",
    title: "101 cách cua đổ đại lão hàng xóm",
    author: "Đồng Vu",
    cover: "/image/anh.png",
    price: 100000,
    originalPrice: 150000,
    quantity: 2,
    stock: 12,
    selected: true,
  },
  {
    id: "cart-2",
    bookId: "2",
    title: "Tôi thấy hoa vàng trên cỏ xanh",
    author: "Nguyễn Nhật Ánh",
    cover: "/image/anh.png",
    price: 85000,
    originalPrice: 100000,
    quantity: 1,
    stock: 5,
    selected: true,
  },
  {
    id: "cart-3",
    bookId: "3",
    title: "Đắc nhân tâm",
    author: "Dale Carnegie",
    cover: "/image/anh.png",
    price: 120000,
    quantity: 1,
    stock: 20,
    selected: false,
  },
  {
    id: "cart-4",
    bookId: "4",
    title: "Nhà giả kim",
    author: "Paulo Coelho",
    cover: "/image/anh.png",
    price: 95000,
    originalPrice: 110000,
    quantity: 3,
    stock: 8,
    selected: true,
  },
];

const MOCK_VOUCHERS: Voucher[] = [
  { code: "FREESHIP", discount: 0, minOrder: 200000, maxDiscount: 30000 },
  { code: "SAVE10", discount: 10, minOrder: 300000, maxDiscount: 50000 },
  { code: "SAVE20", discount: 20, minOrder: 500000, maxDiscount: 100000 },
];

const MOCK_SUGGESTED_BOOKS = [
  { id: "s1", title: "Bố Già", author: "Mario Puzo", cover: "/image/anh.png", price: 150000 },
  { id: "s2", title: "Tuổi trẻ đáng giá bao nhiêu", author: "Rosie Nguyễn", cover: "/image/anh.png", price: 90000 },
  { id: "s3", title: "Càng kỷ luật càng tự do", author: "Jocko Willink", cover: "/image/anh.png", price: 110000 },
  { id: "s4", title: "7 thói quen hiệu quả", author: "Stephen Covey", cover: "/image/anh.png", price: 130000 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART_ITEMS);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");

  // ========== CALCULATIONS ==========
  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount > 0) {
      discount = Math.min((subtotal * appliedVoucher.discount) / 100, appliedVoucher.maxDiscount);
    } else {
      discount = appliedVoucher.maxDiscount; // Free ship
    }
  }
  
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const finalShippingFee = appliedVoucher?.code === "FREESHIP" ? 0 : shippingFee;
  const total = subtotal - discount + finalShippingFee;

  // ========== HANDLERS ==========
  const handleSelectAll = (checked: boolean) => {
    setCartItems(cartItems.map((item) => ({ ...item, selected: checked })));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, selected: checked } : item)));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cartItems.find((item) => item.id === id);
    if (item && newQuantity > item.stock) {
      alert(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
      return;
    }
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const handleRemoveItem = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  const handleClearCart = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      setCartItems([]);
      setAppliedVoucher(null);
    }
  };

  const handleApplyVoucher = () => {
    setVoucherError("");
    const voucher = MOCK_VOUCHERS.find((v) => v.code === voucherCode.toUpperCase());
    
    if (!voucher) {
      setVoucherError("Mã giảm giá không hợp lệ");
      return;
    }
    
    if (subtotal < voucher.minOrder) {
      setVoucherError(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này`);
      return;
    }
    
    setAppliedVoucher(voucher);
    setVoucherCode("");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {cartItems.length} sản phẩm trong giỏ hàng
                </span>
                {selectedItems.length > 0 && (
                  <Badge variant="info" size="sm">
                    {selectedItems.length} đã chọn
                  </Badge>
                )}
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button
                onClick={handleClearCart}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium">Chọn tất cả ({cartItems.length} sản phẩm)</span>
              </div>
            )}

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm">
                <EmptyState
                  icon={
                    <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                  title="Giỏ hàng trống"
                  description="Bạn chưa có sản phẩm nào trong giỏ hàng"
                  action={{
                    label: 'Mua sắm ngay',
                    onClick: () => globalThis.location.href = '/books'
                  }}
                />
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-2">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                    </div>

                    {/* Book Cover */}
                    <Link href={`/books/${item.bookId}`} className="flex-shrink-0">
                      <Image
                        src={item.cover}
                        alt={item.title}
                        width={120}
                        height={160}
                        className="rounded-lg object-cover"
                      />
                    </Link>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/books/${item.bookId}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">Tác giả: {item.author}</p>
                      
                      {/* Price */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xl font-bold text-red-600">
                          {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                            <Badge variant="danger" size="sm">
                              -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                            </Badge>
                          </>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className="w-16 text-center border border-gray-300 rounded px-2 py-1 bg-gray-50 cursor-default [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                            max={item.stock}
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <Badge 
                            variant={item.stock < 5 ? "warning" : "default"} 
                            size="sm"
                          >
                            Còn {item.stock}
                          </Badge>
                        </div>

                        <Button
                          onClick={() => handleRemoveItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Suggested Products */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Có thể bạn quan tâm</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {MOCK_SUGGESTED_BOOKS.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100 mb-2">
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-1">{book.author}</p>
                      <p className="text-sm font-bold text-red-600">{formatCurrency(book.price)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h3>

                {/* Voucher Section */}
                <div className="mb-6">
                  <label htmlFor="voucher-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        id="voucher-input"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className={voucherError ? 'border-red-500' : ''}
                      />
                    </div>
                    <Button
                      onClick={handleApplyVoucher}
                      variant="primary"
                      size="lg"
                      className="flex-shrink-0"
                    >
                      Áp dụng
                    </Button>
                  </div>
                  {voucherError && (
                    <p className="mt-1 text-sm text-red-600">{voucherError}</p>
                  )}
                  {appliedVoucher && (
                    <Alert variant="success" onClose={handleRemoveVoucher}>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">
                            Đã áp dụng mã {appliedVoucher.code}
                          </p>
                          <p className="text-xs mt-1">
                            {appliedVoucher.discount > 0
                              ? `Giảm ${appliedVoucher.discount}% (tối đa ${formatCurrency(appliedVoucher.maxDiscount)})`
                              : `Miễn phí vận chuyển (tối đa ${formatCurrency(appliedVoucher.maxDiscount)})`}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Available Vouchers */}
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">Mã khuyến mãi có sẵn:</p>
                    {MOCK_VOUCHERS.map((voucher) => (
                      <button
                        key={voucher.code}
                        onClick={() => {
                          setVoucherCode(voucher.code);
                          handleApplyVoucher();
                        }}
                        className="w-full text-left border border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <Badge variant="info" size="sm">
                            {voucher.code}
                          </Badge>
                          {subtotal >= voucher.minOrder ? (
                            <Badge variant="success" size="sm">
                              Có thể dùng
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              Chưa đủ điều kiện
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 font-medium mt-2">
                          {voucher.discount > 0
                            ? `Giảm ${voucher.discount}% (tối đa ${formatCurrency(voucher.maxDiscount)})`
                            : `Miễn phí vận chuyển (tối đa ${formatCurrency(voucher.maxDiscount)})`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Đơn tối thiểu {formatCurrency(voucher.minOrder)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính ({totalQuantity} sản phẩm)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">
                      {finalShippingFee === 0 ? (
                        <Badge variant="success" size="sm">
                          Miễn phí
                        </Badge>
                      ) : (
                        formatCurrency(finalShippingFee)
                      )}
                    </span>
                  </div>
                  
                  {subtotal < 500000 && finalShippingFee > 0 && (
                    <Alert variant="info">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs">
                          Mua thêm {formatCurrency(500000 - subtotal)} để được miễn phí vận chuyển
                        </span>
                      </div>
                    </Alert>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href={selectedItems.length > 0 ? "/checkout" : "#"}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={selectedItems.length === 0}
                    onClick={(e) => {
                      if (selectedItems.length === 0) {
                        e.preventDefault();
                        alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
                      }
                    }}
                  >
                    Thanh toán ({selectedItems.length})
                  </Button>
                </Link>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Thanh toán an toàn và bảo mật</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
