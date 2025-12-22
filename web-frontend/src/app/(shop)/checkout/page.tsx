'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { cartService } from '@/services/cart.service';
import { bookService } from '@/services/book.service';
import { userProfileService } from '@/services/user-profile.service';
import { orderService } from '@/services/order.service'; // Import OrderService
import { resolveBookPrice } from '@/lib/price';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276';

const getFullImageUrl = (url?: string | null) => {
  if (!url) return '/image/anh.png';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface CheckoutItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  image: string;
  price: number;
  quantity: number;
  format?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('qr');
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    note: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra backend có hoạt động không
        console.log('[CHECKOUT] API URL:', process.env.NEXT_PUBLIC_API_URL);
        
        // 1. Get Profile
        try {
          const profileRes: any = await userProfileService.getMyProfile();
          const profile = profileRes.data || profileRes;
          if (profile) {
            setUserId(profile.id);
            setFormData(prev => ({
              ...prev,
              fullName: profile.fullName || '',
              email: profile.email || '',
              phone: profile.phoneNumber || '',
            }));
          }
        } catch (err) { 
          console.warn("[CHECKOUT] Chưa đăng nhập hoặc không lấy được profile:", err); 
        }

        // 2. Get Cart
        const cartRes: any = await cartService.getMyCart();
        const rawItems = Array.isArray(cartRes) ? cartRes : (cartRes?.items || []);

        if (rawItems.length > 0) {
          const enrichedItems: CheckoutItem[] = await Promise.all(
            rawItems.map(async (item: any) => {
              try {
                const bookDetails: any = await bookService.getBookById(item.bookId);
                const priceInfo = resolveBookPrice(bookDetails);
                return {
                  id: item.id,
                  bookId: item.bookId,
                  title: bookDetails.title,
                  author: bookDetails.authorNames?.[0] || "Tác giả ẩn danh",
                  image: getFullImageUrl(bookDetails.coverImage),
                  price: priceInfo.finalPrice,
                  quantity: item.quantity,
                  format: bookDetails.bookFormat?.name || 'Tiêu chuẩn'
                };
              } catch (e) { return null; }
            })
          );
          setCartItems(enrichedItems.filter((i): i is CheckoutItem => i !== null));
        }
      } catch (error) {
        console.error("Lỗi tải trang thanh toán:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
        alert("Giỏ hàng đang trống");
        return;
    }

    if (!formData.fullName || !formData.phone) {
        alert("Vui lòng điền đầy đủ thông tin người nhận");
        return;
    }

    setIsProcessing(true);
    
    try {
        // --- 1. Tạo Payload tạo đơn hàng (PascalCase for .NET backend) ---
        const orderPayload = {
            UserId: userId, // Backend will override this with JWT token user ID
            Items: cartItems.map(item => ({
                BookId: item.bookId,
                Quantity: item.quantity,
                UnitPrice: item.price
            })),
            Address: {
                RecipientName: formData.fullName,
                PhoneNumber: formData.phone,
                Province: formData.city,
                District: formData.district,
                Ward: formData.ward,
                Street: formData.address || "Mặc định",
                Note: formData.note
            },
            CouponId: null
        };

        console.log('[CHECKOUT] Payload gửi lên backend:', JSON.stringify(orderPayload, null, 2));

        // --- 2. Gọi API Tạo Đơn Hàng Thật ---
        const createdOrder = await orderService.createOrder(orderPayload);
        console.log('[CHECKOUT] Response từ backend:', createdOrder);
        
        // Lấy thông tin thật từ Server trả về (hỗ trợ nhiều format response)
        const realOrderId = createdOrder.orderNumber || createdOrder.id || createdOrder.orderId;
        const realTotalAmount = createdOrder.finalAmount || createdOrder.totalAmount || total;

        if (!realOrderId) {
            throw new Error('Backend không trả về mã đơn hàng (orderNumber)');
        }

        console.log('[CHECKOUT] Order ID:', realOrderId, '| Amount:', realTotalAmount);

        if (paymentMethod === 'cod') {
            await cartService.clearCart();
            setShowSuccessModal(true);
            setIsProcessing(false);
        } else {
            // --- 3. Chuyển hướng sang trang QR với OrderNumber THẬT ---
            const query = new URLSearchParams({
                type: 'buy',
                orderId: realOrderId, // Mã đơn hàng thật (quan trọng cho SePay)
                amount: realTotalAmount.toString(),
            });

            console.log('[CHECKOUT] Redirect to QR page with:', query.toString());
            router.push(`/payment/qr?${query.toString()}`);
        }

    } catch (error: any) {
        console.error('[CHECKOUT] Lỗi đặt hàng:', error);
        
        // Log chi tiết error
        if (error && typeof error === 'object') {
            console.error('[CHECKOUT] Error details:', {
                message: error.message || 'No message',
                name: error.name || 'Unknown',
                statusCode: error.statusCode || 'N/A',
                errors: error.errors || null,
                response: error.response?.data || null,
                stack: error.stack || 'No stack'
            });
        } else {
            console.error('[CHECKOUT] Raw error:', error);
        }
        
        let errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại.';
        
        // Xử lý các loại lỗi khác nhau
        if (error?.statusCode === 400 && error?.errors) {
            // Validation errors từ backend
            const validationErrors = Object.entries(error.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('\n');
            errorMessage = `Lỗi dữ liệu:\n${validationErrors}`;
        } else if (error?.response?.data?.message) {
            // Axios error với message từ backend
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        alert(errorMessage);
        setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link> / 
          <Link href="/cart" className="hover:text-blue-600"> Giỏ hàng</Link> / 
          <span className="font-medium text-gray-800">Thanh toán</span>
        </nav>


        {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-xl text-gray-600 mb-4">Không có sản phẩm nào.</p>
                <Link href="/books"><Button>Quay lại mua sắm</Button></Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                {/* Form Thông tin */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin & Địa chỉ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="fullName" value={formData.fullName} onChange={handleInputChange} label="Họ tên" required />
                        <Input name="phone" value={formData.phone} onChange={handleInputChange} label="SĐT" required />
                        <div className="md:col-span-2"><Input name="email" value={formData.email} onChange={handleInputChange} label="Email" required /></div>
                    </div>
                    
                    <div className="mt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={useDefaultAddress} onChange={(e) => setUseDefaultAddress(e.target.checked)} className="w-5 h-5" />
                            <span>Sử dụng địa chỉ mặc định</span>
                        </label>
                    </div>

                    {!useDefaultAddress && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><Input name="address" value={formData.address} onChange={handleInputChange} label="Địa chỉ chi tiết" required /></div>
                            <div className="md:col-span-2"><textarea name="note" value={formData.note} onChange={handleInputChange} rows={2} className="w-full border p-2 rounded" placeholder="Ghi chú..." /></div>
                        </div>
                    )}
                </div>

                {/* Phương thức thanh toán */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                    <div className="space-y-4">
                        <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : ''}`}>
                            <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                            <span>Thanh toán khi nhận hàng (COD)</span>
                        </label>
                        <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50' : ''}`}>
                            <input type="radio" name="payment" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} />
                            <span>Chuyển khoản Ngân hàng (VietQR)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 sticky top-8">
                    <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
                    <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="truncate w-2/3">{item.title} (x{item.quantity})</span>
                                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Phí ship</span><span>{formatPrice(shippingFee)}</span></div>
                        <div className="flex justify-between text-xl font-bold text-red-600 mt-2"><span>Tổng cộng</span><span>{formatPrice(total)}</span></div>
                    </div>
                    <Button onClick={handlePlaceOrder} loading={isProcessing} className="w-full mt-6 py-3 text-lg font-bold bg-blue-600 text-white">
                        {paymentMethod === 'cod' ? 'Đặt hàng' : 'Thanh toán ngay'}
                    </Button>
                </div>
            </div>
            </div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl text-center shadow-2xl">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h3>
                <p className="mb-6">Cảm ơn bạn đã mua sách.</p>
                <Button onClick={() => router.push('/account/orders')}>Xem đơn hàng</Button>
            </div>
        </div>
      )}
    </div>
  );
}