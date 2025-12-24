'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { cartService } from '@/services/cart.service';
import { bookService } from '@/services/book.service';
import { userProfileService } from '@/services/user-profile.service';
import { orderService } from '@/services/order.service';
import { resolveBookPrice } from '@/lib/price';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276';

// --- FIX 4: Hàm xử lý ảnh an toàn, tránh lỗi Image missing src ---
const getFullImageUrl = (url?: string | null) => {
  if (!url || url.trim() === "") return '/image/anh.png'; // Ảnh placeholder
  if (url.startsWith('http')) return url;
  // Đảm bảo dấu /
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  // Nếu API_BASE_URL có / ở cuối thì bỏ đi
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBase}${cleanUrl}`;
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
        
        // Check token
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          alert('Vui lòng đăng nhập để tiếp tục');
          router.push('/login');
          return;
        }
        
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
          console.warn("[CHECKOUT] Không lấy được profile:", err); 
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
                
                // Dùng hàm getFullImageUrl an toàn
                const validImage = getFullImageUrl(bookDetails.coverImage);

                return {
                  id: item.id,
                  bookId: item.bookId,
                  title: bookDetails.title,
                  author: bookDetails.authorNames?.[0] || "Tác giả ẩn danh",
                  image: validImage, 
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
  }, [router]);

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
        if (!userId) {
            alert('Lỗi: Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
            router.push('/login');
            return;
        }

        // --- 1. Payload ---
        const orderPayload = {
            UserId: userId,
            Items: cartItems.map(item => ({
                BookId: item.bookId,
                Quantity: item.quantity,
                UnitPrice: item.price
            })),
            Address: {
                RecipientName: formData.fullName,
                PhoneNumber: formData.phone,
                Province: formData.city,
                District: formData.district || '',
                Ward: formData.ward || '',
                Street: formData.address || "Chưa cung cấp",
                Note: formData.note || ''
            },
            CouponId: null
        };

        // --- 2. Gọi API ---
        console.log("Đang tạo đơn hàng với payload:", orderPayload);
        const createdOrder = await orderService.createOrder(orderPayload);
        
        console.log('[DEBUG] Response CreateOrder:', createdOrder);
        
        // --- FIX 5: Logic trích xuất Order ID cực mạnh (chấp nhận mọi format) ---
        // Backend có thể trả về: { id: "..." } hoặc { orderNumber: "..." } hoặc { data: { ... } }
        // Hoặc PascalCase: { Id: "..." }, { OrderNumber: "..." }
        
        let realOrderId = null;
        let realTotalAmount = total;

        // Helper check object
        const findId = (obj: any) => obj?.orderNumber || obj?.OrderNumber || obj?.id || obj?.Id;
        const findAmount = (obj: any) => obj?.finalAmount || obj?.FinalAmount || obj?.totalAmount || obj?.TotalAmount;

        // Check level 1
        realOrderId = findId(createdOrder);
        if (findAmount(createdOrder)) realTotalAmount = findAmount(createdOrder);

        // Check level 2 (nếu response bọc trong data)
        if (!realOrderId && createdOrder.data) {
             realOrderId = findId(createdOrder.data);
             if (findAmount(createdOrder.data)) realTotalAmount = findAmount(createdOrder.data);
        }

        // Nếu vẫn không thấy
        if (!realOrderId) {
             console.error("CRITICAL ERROR: Không tìm thấy Order ID trong response", createdOrder);
             alert("Tạo đơn hàng thành công nhưng không lấy được mã đơn hàng. Vui lòng kiểm tra lịch sử đơn hàng.");
             router.push('/account/orders');
             return;
        }

        console.log('=> ID Đơn hàng lấy được:', realOrderId);

        if (paymentMethod === 'cod') {
            await cartService.clearCart();
            setShowSuccessModal(true);
            setIsProcessing(false);
        } else {
            // --- 3. Chuyển hướng sang trang QR ---
            const query = new URLSearchParams({
                type: 'buy',
                orderId: realOrderId, // Chắc chắn có giá trị
                amount: realTotalAmount.toString(),
            });

            console.log('Redirecting to QR:', `/payment/qr?${query.toString()}`);
            router.push(`/payment/qr?${query.toString()}`);
        }

    } catch (error: any) {
        console.error('[CHECKOUT ERROR]', error);
        
        let errorMessage = 'Không thể tạo đơn hàng.';
        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        alert(`Lỗi: ${errorMessage}`);
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
                            <div className="flex items-center gap-2">
                                <span>Chuyển khoản Ngân hàng (VietQR)</span>
                                {/* Badge gợi ý */}
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Khuyên dùng</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 sticky top-8">
                    <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
                    <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex gap-3 text-sm mb-2">
                                {/* Hiển thị ảnh nhỏ trong summary */}
                                <div className="relative w-12 h-16 flex-shrink-0 border rounded overflow-hidden">
                                   <Image src={item.image} alt="" fill className="object-cover"/>
                                </div>
                                <div className="flex-1">
                                   <div className="font-medium truncate">{item.title}</div>
                                   <div className="text-gray-500">x{item.quantity}</div>
                                </div>
                                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Phí ship</span><span>{formatPrice(shippingFee)}</span></div>
                        <div className="flex justify-between text-xl font-bold text-red-600 mt-2"><span>Tổng cộng</span><span>{formatPrice(total)}</span></div>
                    </div>
                    <Button onClick={handlePlaceOrder} loading={isProcessing} className="w-full mt-6 py-3 text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition">
                        {paymentMethod === 'cod' ? 'Đặt hàng' : 'Thanh toán ngay'}
                    </Button>
                </div>
            </div>
            </div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h3>
                <p className="mb-6 text-gray-600">Cảm ơn bạn đã mua sách.</p>
                <Button onClick={() => router.push('/account/orders')}>Xem đơn hàng</Button>
            </div>
        </div>
      )}
    </div>
  );
}