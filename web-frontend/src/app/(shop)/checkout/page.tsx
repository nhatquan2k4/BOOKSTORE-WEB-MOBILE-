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
import { addressService } from '@/services/user.service';
import { resolveBookPrice } from '@/lib/price';
import { normalizeImageUrl } from '@/lib/imageUtils';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- Helper lấy dữ liệu an toàn (Bất chấp hoa thường) ---
const getSafeValue = (obj: Record<string, unknown> | null | undefined, keys: string[]): string | undefined => {
    if (!obj) return undefined;
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === 'string' && value.trim() !== '') return value;
    }
    return undefined;
};

interface CheckoutItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  image: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('qr');
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [userId, setUserId] = useState<string>("");
    const [defaultAddress, setDefaultAddress] = useState<Record<string, unknown> | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  // --- INIT DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          router.push('/login');
          return;
        }
        
        // 1. Get Profile
                try {
                    const profileRes = await userProfileService.getMyProfile();
                    // profileRes có thể là { data: UserProfile } hoặc UserProfile
                    const profile = (profileRes as { data?: { id?: string; fullName?: string; email?: string; phoneNumber?: string } }).data || profileRes;
                    if (profile && typeof profile === 'object') {
                        setUserId((profile as { id?: string }).id || '');
                        setFormData(prev => ({
                            ...prev,
                            fullName: (profile as { fullName?: string }).fullName || '',
                            email: (profile as { email?: string }).email || '',
                            phone: (profile as { phoneNumber?: string }).phoneNumber || '',
                        }));
                    }
                } catch { }

        // 2. Default Address (QUAN TRỌNG: Log để debug)
                try {
                    const res = await addressService.getDefaultAddress();
                    const addr = (res as { data?: Record<string, unknown> }).data || res;
                    // addr phải là object và có id (string)
                    if (addr && typeof addr === 'object' && ('id' in addr)) {
                        console.log("✅ Loaded Default Address:", addr);
                        setDefaultAddress(addr as Record<string, unknown>);
                        setUseDefaultAddress(true);
                        setFormData(prev => ({
                                ...prev,
                                fullName: getSafeValue(addr as Record<string, unknown>, ['recipientName', 'RecipientName']) || prev.fullName,
                                phone: getSafeValue(addr as Record<string, unknown>, ['phoneNumber', 'PhoneNumber']) || prev.phone,
                                address: getSafeValue(addr as Record<string, unknown>, ['streetAddress', 'StreetAddress', 'street', 'Street']) || '',
                                city: getSafeValue(addr as Record<string, unknown>, ['province', 'Province']) || '',
                                district: getSafeValue(addr as Record<string, unknown>, ['district', 'District']) || '',
                                ward: getSafeValue(addr as Record<string, unknown>, ['ward', 'Ward']) || '',
                        }));
                    } else {
                        console.warn("⚠️ No default address found or invalid structure:", res);
                        setUseDefaultAddress(false);
                    }
                } catch { setUseDefaultAddress(false); }

        // 3. Cart
                const cartRes = await cartService.getMyCart();
                const rawItems = Array.isArray(cartRes) ? cartRes : (cartRes as { items?: unknown[] })?.items || [];
                if (rawItems.length > 0) {
                    const enrichedItems = await Promise.all(
                        rawItems.map(async (item) => {
                            try {
                                const bookDetails = await bookService.getBookById((item as { bookId: string }).bookId);
                                const priceInfo = resolveBookPrice(bookDetails);
                                const validImage = normalizeImageUrl((bookDetails as { coverImage?: string }).coverImage);
                                return {
                                    id: (item as { id: string }).id,
                                    bookId: (item as { bookId: string }).bookId,
                                    title: (bookDetails as { title?: string }).title || '',
                                    author: ((bookDetails as { authorNames?: string[] }).authorNames?.[0]) || "Tác giả",
                                    image: validImage || '',
                                    price: priceInfo.finalPrice,
                                    quantity: (item as { quantity: number }).quantity,
                                };
                            } catch { return undefined; }
                        })
                    );
                    setCartItems(enrichedItems.filter((i): i is CheckoutItem => !!i));
                }
      } catch (error) {
        console.error("Lỗi init checkout:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // --- TÍNH TOÁN TIỀN ---
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; // Free ship theo yêu cầu
  const estimatedTotal = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- HÀM TẠO ĐƠN (ĐÃ FIX LỖI UNDEFINED) ---
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert("Giỏ hàng trống");

    // 1. Xác định dữ liệu địa chỉ cuối cùng
        let finalAddressData: {
            RecipientName?: string;
            PhoneNumber?: string;
            Province?: string;
            District?: string;
            Ward?: string;
            Street?: string;
            Note?: string;
        } = {};

    // Logic lấy dữ liệu an toàn (Fallback từ Default -> Form)
    if (useDefaultAddress && defaultAddress) {
        console.log("👉 Đang dùng địa chỉ mặc định:", defaultAddress);
        
        finalAddressData = {
            RecipientName: getSafeValue(defaultAddress, ['recipientName', 'RecipientName']) || formData.fullName,
            PhoneNumber: getSafeValue(defaultAddress, ['phoneNumber', 'PhoneNumber']) || formData.phone,
            Province: getSafeValue(defaultAddress, ['province', 'Province']) || formData.city,
            District: getSafeValue(defaultAddress, ['district', 'District']) || formData.district,
            Ward: getSafeValue(defaultAddress, ['ward', 'Ward']) || formData.ward,
            Street: getSafeValue(defaultAddress, ['streetAddress', 'StreetAddress', 'street', 'Street']) || formData.address,
            Note: formData.note
        };
    } else {
        // Dùng dữ liệu nhập tay
        finalAddressData = {
            RecipientName: formData.fullName,
            PhoneNumber: formData.phone,
            Province: formData.city,
            District: formData.district,
            Ward: formData.ward,
            Street: formData.address,
            Note: formData.note
        };
    }

    // 2. Validate dữ liệu trước khi gửi (Chặn đứng lỗi undefined)
    const missingFields = [];
    if (!finalAddressData.RecipientName) missingFields.push("Tên người nhận");
    if (!finalAddressData.PhoneNumber) missingFields.push("Số điện thoại");
    if (!finalAddressData.Street) missingFields.push("Địa chỉ");
    if (!finalAddressData.Province) missingFields.push("Tỉnh/Thành");

    if (missingFields.length > 0) {
        console.error("❌ Dữ liệu địa chỉ bị thiếu:", finalAddressData);
        alert(`Vui lòng điền đầy đủ: ${missingFields.join(', ')}`);
        return;
    }

    setIsProcessing(true);
    
    try {
        const fullAddressString = `${finalAddressData.Street}, ${finalAddressData.Ward}, ${finalAddressData.District}, ${finalAddressData.Province}`;

        const orderPayload = {
            userId: userId,
            items: cartItems.map(item => ({
                bookId: item.bookId,
                quantity: item.quantity,
                unitPrice: item.price
            })),
            address: { 
                recipientName: finalAddressData.RecipientName,
                phoneNumber: finalAddressData.PhoneNumber,
                province: finalAddressData.Province,
                district: finalAddressData.District,
                ward: finalAddressData.Ward,
                street: finalAddressData.Street,
                note: finalAddressData.Note
            },
            shippingAddress: fullAddressString,
            note: finalAddressData.Note || '',
            couponId: null,
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BankTransfer'
        };

        console.log("🚀 Payload gửi đi:", orderPayload);

        // 3. Gọi Backend
        const createdOrder: { id?: string; orderNumber?: string } = await orderService.createOrder(orderPayload);
        console.log("🔥 Kết quả từ Server:", createdOrder);

        // 4. Lấy ID an toàn
        let realOrderId = createdOrder?.id || createdOrder?.orderNumber;
        if (!realOrderId) {
            alert("Tạo đơn thành công nhưng không lấy được mã đơn. Vui lòng kiểm tra lịch sử.");
            router.push('/account/orders');
            return; 
        }

        // 5. Chuyển hướng
        if (paymentMethod === 'cod') {
            await cartService.clearCart();
            router.push(`/payment/success?type=cod&orderId=${realOrderId}`);
        } else {
            router.push(`/payment/qr?type=buy&orderId=${realOrderId}`);
        }

        } catch (error) {
                console.error('[CHECKOUT ERROR]', error);
                let msg = "Lỗi tạo đơn hàng";
                if (typeof error === 'object' && error && 'response' in error && typeof (error as any).response?.data?.message === 'string') {
                    msg = (error as { response: { data: { message: string } } }).response.data.message;
                } else if (typeof error === 'object' && error && 'response' in error && typeof (error as any).response?.data === 'string') {
                    msg = (error as { response: { data: string } }).response.data;
                }
                alert(msg);
                setIsProcessing(false);
        }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link> / 
          <Link href="/cart" className="hover:text-blue-600"> Giỏ hàng</Link> / 
          <span className="font-bold text-gray-900">Thanh toán</span>
        </nav>

        {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-xl text-gray-600 mb-4">Giỏ hàng trống.</p>
                <Link href="/books"><Button>Mua sắm ngay</Button></Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* FORM THÔNG TIN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">1. Thông tin người nhận</h2>
                        
                        {/* Checkbox Default Address */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition">
                                <input 
                                    type="checkbox" 
                                    checked={useDefaultAddress} 
                                    onChange={(e) => {
                                        if (e.target.checked && !defaultAddress) {
                                            alert("Bạn chưa thiết lập địa chỉ mặc định trong hồ sơ!");
                                            return;
                                        }
                                        setUseDefaultAddress(e.target.checked);
                                    }} 
                                    className="w-5 h-5 text-blue-600" 
                                />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900">Sử dụng địa chỉ mặc định</span>
                                    {defaultAddress ? (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {/* Hiển thị an toàn */}
                                            {(getSafeValue(defaultAddress, ['recipientName', 'RecipientName']) || '')} - {(getSafeValue(defaultAddress, ['phoneNumber', 'PhoneNumber']) || '')} <br/>
                                            {(getSafeValue(defaultAddress, ['streetAddress', 'StreetAddress', 'street', 'Street']) || '')}, {(getSafeValue(defaultAddress, ['ward', 'Ward']) || '')}, {(getSafeValue(defaultAddress, ['district', 'District']) || '')}, {(getSafeValue(defaultAddress, ['province', 'Province']) || '')}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-orange-500 mt-0.5">(Chưa có địa chỉ mặc định)</p>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Form nhập tay (Hiện khi bỏ tick hoặc chưa có default) */}
                        {(!useDefaultAddress || !defaultAddress) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input name="fullName" value={formData.fullName} onChange={handleInputChange} label="Họ tên người nhận" required placeholder="Ví dụ: Nguyễn Văn A" />
                                    <Input name="phone" value={formData.phone} onChange={handleInputChange} label="Số điện thoại" required placeholder="Ví dụ: 0901234567" />
                                    <div className="md:col-span-2"><Input name="email" value={formData.email} onChange={handleInputChange} label="Email nhận thông báo" required /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input name="city" value={formData.city} onChange={handleInputChange} label="Tỉnh/Thành phố" required placeholder="Hà Nội" />
                                    <Input name="district" value={formData.district} onChange={handleInputChange} label="Quận/Huyện" required placeholder="Cầu Giấy" />
                                    <Input name="ward" value={formData.ward} onChange={handleInputChange} label="Phường/Xã" required placeholder="Dịch Vọng" />
                                    <div className="md:col-span-3"><Input name="address" value={formData.address} onChange={handleInputChange} label="Địa chỉ cụ thể (Số nhà, đường)" required placeholder="Số 123 Đường ABC" /></div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                             <label className="text-sm font-medium text-gray-700">Ghi chú đơn hàng (Tùy chọn)</label>
                             <textarea name="note" value={formData.note} onChange={handleInputChange} rows={2} className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Ví dụ: Giao giờ hành chính..." />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">2. Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'hover:border-gray-300'}`}>
                                <input type="radio" name="payment" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="mr-3 w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-bold flex items-center gap-2 text-gray-900">
                                        Chuyển khoản Ngân hàng (QR Code) 
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">KHUYÊN DÙNG</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">Quét mã QR, hệ thống xác nhận tự động</div>
                                </div>
                            </label>
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'hover:border-gray-300'}`}>
                                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-3 w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                                    <div className="text-sm text-gray-500 mt-1">Thanh toán tiền mặt cho shipper khi nhận hàng</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border sticky top-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Đơn hàng</h2>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-3 text-sm group">
                                    <div className="w-12 h-16 relative border rounded flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {item.image && typeof item.image === 'string' && item.image.trim() !== '' ? (
                                            <Image src={item.image} alt={item.title || 'Book'} fill className="object-cover group-hover:scale-105 transition-transform"/>
                                        ) : (
                                            <span className="text-xs text-gray-400">No Image</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="line-clamp-2 font-medium text-gray-800">{item.title}</div>
                                        <div className="text-gray-500 mt-1">x{item.quantity}</div>
                                    </div>
                                    <div className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="text-green-600 font-bold">Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-red-600 pt-3 border-t mt-2">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(estimatedTotal)}</span>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handlePlaceOrder} 
                            loading={isProcessing}
                            disabled={isProcessing}
                            className="w-full mt-6 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:shadow-xl"
                        >
                            {paymentMethod === 'qr' ? 'Thanh toán ngay' : 'Đặt hàng'}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-3 px-2">
                            Nhấn đặt hàng đồng nghĩa với việc bạn đồng ý với các điều khoản của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}