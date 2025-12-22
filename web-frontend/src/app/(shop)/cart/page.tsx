"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Badge, EmptyState, Alert } from "@/components/ui";
import { cartService } from "@/services/cart.service";
import { couponService, CouponDto } from "@/services/coupon.service";
import { bookService } from "@/services/book.service";
import { resolveBookPrice, formatPrice } from "@/lib/price"; // Đã import formatPrice ở đây

// Type nội bộ cho UI
type CartItemUI = {
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
  isValid: boolean;    
};

export default function CartPage() {
  const router = useRouter();
  
  // --- States ---
  const [cartItems, setCartItems] = useState<CartItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Coupon States
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<CouponDto | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [publicCoupons, setPublicCoupons] = useState<CouponDto[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Recommendation States
  const [suggestedBooks, setSuggestedBooks] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // =====================================================================
  // 1. FETCH CART DATA & SYNC WITH BOOK DETAILS
  // =====================================================================
  useEffect(() => {
    const fetchCartAndSync = async () => {
      try {
        setLoading(true);
        const cartResponse = await cartService.getMyCart();
        
        const rawItems = Array.isArray(cartResponse) 
            ? cartResponse 
            : (cartResponse?.items || []);

        if (!rawItems || rawItems.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const enrichedItems: CartItemUI[] = await Promise.all(
          rawItems.map(async (item: any) => {
            try {
              const bookDetails = await bookService.getBookById(item.bookId);
              const priceInfo = resolveBookPrice(bookDetails);

              return {
                id: item.id,
                bookId: item.bookId,
                title: bookDetails.title,
                author: bookDetails.authors?.[0]?.name || bookDetails.authorNames?.[0] || "Đang cập nhật",
                cover: bookDetails.images?.find((i: any) => i.isCover)?.imageUrl || bookDetails.coverImage || "/image/anh.png",
                price: priceInfo.finalPrice, 
                originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
                quantity: item.quantity,
                stock: bookDetails.stockQuantity || 0, 
                selected: true,
                isValid: true
              };
            } catch (error) {
              console.error(`Lỗi đồng bộ sách ID ${item.bookId}`, error);
              return {
                id: item.id,
                bookId: item.bookId,
                title: item.bookTitle || "Sản phẩm không tồn tại",
                author: "",
                cover: "/image/anh.png",
                price: item.unitPrice || 0,
                quantity: item.quantity,
                stock: 0,
                selected: false,
                isValid: false
              };
            }
          })
        );

        setCartItems(enrichedItems.filter(i => i.isValid)); 
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndSync();
  }, []);

  // =====================================================================
  // 2. FETCH PUBLIC COUPONS
  // =====================================================================
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const response: any = await couponService.getPublicCoupons();
        const data = Array.isArray(response) ? response : (response?.items || response?.data || []);
        
        if (Array.isArray(data)) {
            const valid = data.filter((c: any) => !couponService.isExpired(c));
            setPublicCoupons(valid);
        }
      } catch (error) {
        console.error("Lỗi tải mã giảm giá:", error);
      } finally {
        setLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  // =====================================================================
  // 3. FETCH RECOMMENDATIONS
  // =====================================================================
  useEffect(() => {
    if (cartItems.length === 0) return;

    const fetchRecs = async () => {
      try {
        setLoadingSuggestions(true);
        const excludeIds = cartItems.map(i => i.bookId);
        const recs = await bookService.getRecommendations(excludeIds, [], 4);
        setSuggestedBooks(recs);
      } catch (error) {
        console.error("Lỗi tải gợi ý:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchRecs();
  }, [cartItems.length]);

  // =====================================================================
  // 4. CALCULATIONS
  // =====================================================================
  const selectedItems = useMemo(() => cartItems.filter(i => i.selected), [cartItems]);
  
  const subtotal = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
  [selectedItems]);

  const totalQuantity = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.quantity, 0), 
  [selectedItems]);

  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    return couponService.calculateDiscount(appliedVoucher, subtotal);
  }, [appliedVoucher, subtotal]);

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // =====================================================================
  // 5. HANDLERS
  // =====================================================================

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (newQty < 1) return;
    if (newQty > item.stock) {
        alert(`Kho chỉ còn ${item.stock} cuốn.`);
        return;
    }

    try {
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
        // LƯU Ý: Dùng bookId theo service mới
        await cartService.updateCartItemQuantity(item.bookId, newQty);
    } catch (error) {
        console.error("Lỗi cập nhật số lượng", error);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: item.quantity } : i));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm("Bạn muốn xóa sách này khỏi giỏ?")) return;
    try {
        // LƯU Ý: Dùng bookId theo service mới
        await cartService.removeCartItem(item.bookId);
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    } catch (error) {
        alert("Xóa thất bại.");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Xóa toàn bộ giỏ hàng?")) return;
    try {
        await cartService.clearCart();
        setCartItems([]);
        setAppliedVoucher(null);
    } catch (error) {
        alert("Lỗi khi xóa giỏ hàng.");
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setApplyingCoupon(true);
    setVoucherError("");

    try {
        const res = await couponService.validateCoupon(voucherCode, subtotal);
        if (res.success && res.coupon) {
            setAppliedVoucher(res.coupon);
            setVoucherCode(""); 
        } else {
            setVoucherError(res.message || "Mã không hợp lệ");
        }
    } catch (error: any) {
        setVoucherError(error.message || "Lỗi kiểm tra mã");
    } finally {
        setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
    }
    router.push('/checkout');
  };

  // =====================================================================
  // UI RENDER
  // =====================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 px-4 max-w-7xl mx-auto">
         <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Trang chủ</Link> / <span className="text-gray-900 font-medium">Giỏ hàng</span>
        </div>

        {/* Title */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
                <p className="text-gray-500 mt-1">{cartItems.length} sản phẩm trong giỏ</p>
            </div>
            {cartItems.length > 0 && (
                <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={handleClearCart}>
                    Xóa tất cả
                </Button>
            )}
        </div>

        {cartItems.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <EmptyState 
                    title="Giỏ hàng trống" 
                    description="Hãy thêm vài cuốn sách hay vào đây nhé!"
                    action={{ label: "Dạo cửa hàng", onClick: () => router.push('/books') }}
                />
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- LEFT COLUMN: ITEMS --- */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Header Bar */}
                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-blue-600"
                            checked={cartItems.length > 0 && cartItems.every(i => i.selected)}
                            onChange={(e) => setCartItems(prev => prev.map(i => ({...i, selected: e.target.checked})))}
                        />
                        <span className="font-medium">Chọn tất cả ({cartItems.length} sản phẩm)</span>
                    </div>

                    {/* Item List */}
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4 transition-all hover:shadow-md">
                            <div className="pt-2">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-blue-600"
                                    checked={item.selected}
                                    onChange={(e) => setCartItems(prev => prev.map(i => i.id === item.id ? {...i, selected: e.target.checked} : i))}
                                />
                            </div>
                            
                            <div className="relative w-24 h-36 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <Image src={item.cover} alt={item.title} fill className="object-cover" />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <Link href={`/books/${item.bookId}`} className="font-semibold text-gray-900 text-lg hover:text-blue-600 line-clamp-2">
                                        {item.title}
                                    </Link>
                                    <p className="text-sm text-gray-500">{item.author}</p>
                                </div>

                                <div className="flex items-end justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {/* SỬA formatCurrency -> formatPrice */}
                                            <span className="text-lg font-bold text-red-600">{formatPrice(item.price)}</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                                            )}
                                        </div>
                                        {item.stock < 5 && <span className="text-xs text-orange-600">Chỉ còn {item.stock} sản phẩm</span>}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button 
                                                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >-</button>
                                            <span className="px-2 w-8 text-center font-medium">{item.quantity}</span>
                                            <button 
                                                className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                            >+</button>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-sm text-gray-400 hover:text-red-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- RIGHT COLUMN: SUMMARY --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                        <h3 className="font-bold text-lg mb-4">Mã giảm giá</h3>
                        <div className="flex gap-2 mb-2">
                            <Input 
                                placeholder="Nhập mã voucher" 
                                value={voucherCode} 
                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                className={voucherError ? "border-red-500" : ""}
                            />
                            <Button size="sm" onClick={handleApplyVoucher} disabled={applyingCoupon || !voucherCode}>
                                {applyingCoupon ? "..." : "Add"}
                            </Button>
                        </div>
                        {voucherError && <p className="text-xs text-red-600 mb-2">{voucherError}</p>}
                        
                        {appliedVoucher && (
                            <div className="bg-green-50 text-green-700 p-2 rounded text-sm flex justify-between items-center mb-4 border border-green-200">
                                <span>Đã dùng mã: <strong>{appliedVoucher.code}</strong></span>
                                <button onClick={() => setAppliedVoucher(null)} className="text-xs underline">Bỏ</button>
                            </div>
                        )}

                        {/* List Coupon có sẵn */}
                        {publicCoupons.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 mb-2">Mã có sẵn:</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                    {publicCoupons.map(c => (
                                        <div key={c.id} 
                                             onClick={() => { setVoucherCode(c.code); }}
                                             className="border border-dashed border-gray-300 p-2 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition text-sm"
                                        >
                                            <div className="font-bold text-blue-700">{c.code}</div>
                                            <div className="text-xs text-gray-600">{couponService.formatCouponDescription(c)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                {/* SỬA formatCurrency -> formatPrice */}
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Giảm giá</span>
                                {/* SỬA formatCurrency -> formatPrice */}
                                <span>-{formatPrice(discountAmount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                {/* SỬA formatCurrency -> formatPrice */}
                                <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                            </div>
                            
                            {subtotal < 500000 && shippingFee > 0 && (
                                <Alert variant="info" className="bg-blue-50 border-blue-200 text-xs py-2">
                                    {/* SỬA formatCurrency -> formatPrice */}
                                    Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                                </Alert>
                            )}
                            
                            <div className="border-t pt-3 flex justify-between items-end">
                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                <div className="text-right">
                                    {/* SỬA formatCurrency -> formatPrice */}
                                    <span className="text-2xl font-bold text-red-600 block">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full mt-6 text-lg font-bold py-6" 
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0}
                        >
                            Thanh toán ({selectedItems.length})
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}