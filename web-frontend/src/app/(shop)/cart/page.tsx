"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { Button, Input, Badge, EmptyState, Alert } from "@/components/ui";
import { cartService } from "@/services/cart.service";
import { CartItemDto } from "@/types/dtos/cart";
import { couponService, CouponDto } from "@/services/coupon.service";
import { bookService } from "@/services/book.service";

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



// Mock suggested books - Sẽ được thay thế bởi smart recommendations từ API
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
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<CouponDto | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [publicCoupons, setPublicCoupons] = useState<CouponDto[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Fetch cart from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const cartData = await cartService.getMyCart();
        
        if (cartData && cartData.items) {
          // Transform API data to component format
          const transformedItems: CartItem[] = cartData.items.map((item: CartItemDto) => ({
            id: item.id,
            bookId: item.bookId,
            title: item.bookTitle,
            author: item.authorNames || "Chưa rõ tác giả",
            cover: item.bookImageUrl || "/image/anh.png",
            price: item.bookPrice,
            originalPrice: undefined, // API không có originalPrice
            quantity: item.quantity,
            stock: item.stockQuantity,
            selected: true, // Mặc định chọn tất cả
          }));
          setCartItems(transformedItems);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Fetch public coupons
  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const coupons = await couponService.getPublicCoupons();
        // Filter only valid coupons
        const validCoupons = coupons.filter((coupon) => couponService.isValid(coupon));
        setPublicCoupons(validCoupons);
      } catch (error) {
        console.error("Failed to fetch public coupons:", error);
        setPublicCoupons([]);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchPublicCoupons();
  }, []);

  // Fetch smart recommendations based on cart items (same categories, related books)
  const [suggestedBooks, setSuggestedBooks] = useState<typeof MOCK_SUGGESTED_BOOKS>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cartItems.length === 0) {
        setSuggestedBooks([]);
        return;
      }

      try {
        setLoadingSuggestions(true);
        
        // Get book IDs in cart to exclude from recommendations
        const cartBookIds = cartItems.map((item) => item.bookId);

        // Get category IDs from cart items for smart recommendations
        // Note: For now we don't have categories in cart items, so we'll use empty array
        // In future, we can fetch book details to get categories
        const categoryIds: string[] = [];

        // Use new smart recommendation API
        const recommendations = await bookService.getRecommendations(cartBookIds, categoryIds, 8);

        // Transform to component format
        const suggestions = recommendations.slice(0, 4).map((book) => ({
          id: book.id,
          title: book.title,
          author: book.authorNames?.[0] || "Chưa rõ tác giả",
          cover: "/image/anh.png", // BookDto doesn't include images, use placeholder
          price: book.currentPrice || 0,
        }));

        setSuggestedBooks(suggestions);
      } catch (error) {
        console.error("Failed to fetch smart recommendations:", error);
        setSuggestedBooks(MOCK_SUGGESTED_BOOKS);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [cartItems]);

  // ========== CALCULATIONS ==========
  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate discount from coupon
  let discount = 0;
  if (appliedVoucher) {
    discount = couponService.calculateDiscount(appliedVoucher, subtotal);
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal - discount + shippingFee;

  // ========== HANDLERS ==========
  const handleSelectAll = (checked: boolean) => {
    setCartItems(cartItems.map((item) => ({ ...item, selected: checked })));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, selected: checked } : item)));
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cartItems.find((item) => item.id === id);
    if (item && newQuantity > item.stock) {
      alert(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
      return;
    }

    try {
      await cartService.updateCartItemQuantity(id, newQuantity);
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Không thể cập nhật số lượng. Vui lòng thử lại!");
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await cartService.removeCartItem(id);
        setCartItems(cartItems.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Failed to remove item:", error);
        alert("Không thể xóa sản phẩm. Vui lòng thử lại!");
      }
    }
  };

  const handleClearCart = async () => {
    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      try {
        await cartService.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error("Failed to clear cart:", error);
        alert("Không thể xóa giỏ hàng. Vui lòng thử lại!");
      }
    }
  };

  const handleContinueClearCart = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      setCartItems([]);
      setAppliedVoucher(null);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setApplyingCoupon(true);
      setVoucherError("");

      // Call API to validate coupon
      const result = await couponService.validateCoupon(voucherCode.trim().toUpperCase(), subtotal);

      if (result.success) {
        setAppliedVoucher(result.coupon);
        setVoucherCode("");
      } else {
        setVoucherError(result.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Mã giảm giá không hợp lệ";
      setVoucherError(errorMessage);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-gray-200"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Giỏ hàng</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn</h1>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">
                  {cartItems.length} sản phẩm
                </span>
                {selectedItems.length > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <Badge variant="info" className="bg-blue-100 text-blue-700">
                      {selectedItems.length} đã chọn
                    </Badge>
                  </>
                )}
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button
                onClick={handleClearCart}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:border-blue-200 transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-200"
                />
                <span className="font-semibold text-gray-900">Chọn tất cả ({cartItems.length} sản phẩm)</span>
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
                    onClick: () => (globalThis.location.href = '/books')
                  }}
                />
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5"
                >
                  <div className="flex gap-5">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-2">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Book Cover */}
                    <Link href={`/books/${item.bookId}`} className="flex-shrink-0 group">
                      <div className="relative overflow-hidden rounded-xl">
                        <Image
                          src={item.cover}
                          alt={item.title}
                          width={120}
                          height={160}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
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

                      {/* Price + % giảm – CHỈNH SỬA Ở ĐÂY CHO GIỐNG TRANG CHI TIẾT */}
                      <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
                        <span className="text-xl font-bold text-red-600">
                          {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                            <Badge variant="danger" size="sm">
                              -{Math.max(
                                0,
                                Math.round(
                                  (1 - item.price / item.originalPrice) * 100
                                )
                              )}
                              %
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
                            className="w-9 h-9 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className="w-16 text-center border-2 border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 cursor-default font-semibold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                            max={item.stock}
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-9 h-9 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <Badge
                            variant={item.stock < 5 ? "warning" : "default"}
                            size="sm"
                            className="ml-1"
                          >
                            Còn {item.stock}
                          </Badge>
                        </div>

                        <Button
                          onClick={() => handleRemoveItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Suggested Products - Smart recommendations based on cart */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Có thể bạn quan tâm</h3>
                  {loadingSuggestions && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Đang tải...</span>
                    </div>
                  )}
                </div>
                
                {loadingSuggestions ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : suggestedBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {suggestedBooks.map((book) => (
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
                ) : (
                  <p className="text-center text-gray-500 py-8">Không có gợi ý sách phù hợp</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Thông tin đơn hàng</h3>

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
                        className={voucherError ? "border-red-500" : ""}
                      />
                    </div>
                    <Button
                      onClick={handleApplyVoucher}
                      variant="primary"
                      size="lg"
                      className="flex-shrink-0"
                      disabled={applyingCoupon || !voucherCode.trim()}
                    >
                      {applyingCoupon ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        "Áp dụng"
                      )}
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
                          <p className="text-sm font-medium">Đã áp dụng mã {appliedVoucher.code}</p>
                          <p className="text-xs mt-1">
                            {couponService.formatCouponDescription(appliedVoucher)}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Available Public Coupons */}
                  {publicCoupons.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-600 mb-2">Mã khuyến mãi có sẵn:</p>
                      {loadingCoupons ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse border border-dashed border-gray-300 rounded-lg p-3">
                              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        publicCoupons.map((coupon) => {
                          const isExpired = couponService.isExpired(coupon);
                          const discountAmount = couponService.calculateDiscount(coupon, subtotal);

                          return (
                            <button
                              key={coupon.id}
                              onClick={() => {
                                setVoucherCode(coupon.code);
                                handleApplyVoucher();
                              }}
                              disabled={isExpired || applyingCoupon}
                              className="w-full text-left border border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                            >
                              <div className="flex items-start justify-between mb-1">
                                <Badge variant="info" size="sm">
                                  {coupon.code}
                                </Badge>
                                {isExpired ? (
                                  <Badge variant="danger" size="sm">
                                    Đã hết hạn
                                  </Badge>
                                ) : (
                                  <Badge variant="success" size="sm">
                                    Có thể dùng
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 font-medium mt-2">
                                {couponService.formatCouponDescription(coupon)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Giảm ngay {formatCurrency(discountAmount)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                HSD: {new Date(coupon.expiration).toLocaleDateString("vi-VN")}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">Tạm tính ({totalQuantity} sản phẩm)</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-700">Giảm giá</span>
                      <span className="font-semibold text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">Phí vận chuyển</span>
                    <span className="font-semibold text-gray-900">
                      {shippingFee === 0 ? (
                        <Badge variant="success" size="sm" className="text-xs px-2 py-1">
                          Miễn phí
                        </Badge>
                      ) : (
                        formatCurrency(shippingFee)
                      )}
                    </span>
                  </div>

                  {subtotal < 500000 && shippingFee > 0 && (
                    <Alert variant="info" className="bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-blue-800">
                          Mua thêm {formatCurrency(500000 - subtotal)} để được miễn phí vận chuyển
                        </span>
                      </div>
                    </Alert>
                  )}

                  <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-3xl font-bold text-red-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  disabled={selectedItems.length === 0}
                  onClick={(e) => {
                    if (selectedItems.length === 0) {
                      e.preventDefault();
                      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
                      return;
                    }

                    // Chuyển hướng đến trang QR payment cho mua sách
                    const orderId = `ORD${Date.now()}`;
                    const queryParams = new URLSearchParams({
                      type: "buy",
                      orderId: orderId,
                      amount: String(total),
                      items: String(selectedItems.length),
                      subtotal: String(subtotal),
                      discount: String(discount),
                      shipping: String(shippingFee),
                    });
                    router.push(`/payment/qr?${queryParams.toString()}`);
                  }}
                >
                  Thanh toán ({selectedItems.length})
                </Button>

                {/* Security Badge */}
                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Thanh toán an toàn và bảo mật</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
