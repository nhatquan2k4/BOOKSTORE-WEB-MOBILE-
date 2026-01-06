'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { cartService } from '@/services/cart.service';
import { bookService } from '@/services/book.service';
import { userProfileService } from '@/services/user-profile.service';
import { orderService } from '@/services/order.service';
import { addressService } from '@/services/user.service';
import { resolveBookPrice } from '@/lib/price';
import { normalizeImageUrl } from '@/lib/imageUtils';

// Helper format tiền tệ
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Helper lấy dữ liệu an toàn từ object
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

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('qr');
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [defaultAddress, setDefaultAddress] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', address: '', city: '', district: '', ward: '', note: '' });

  // =====================================================================
  // INIT DATA
  // =====================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          router.push('/login');
          return;
        }
        
        // 1. Lấy danh sách ID các sách cần thanh toán từ URL
        const itemsParam = searchParams.get('items');
        
        // --- FIX LOGIC: Nếu không có items nào trên URL -> Redirect về giỏ hàng ngay ---
        // Tránh trường hợp load nhầm toàn bộ giỏ hàng
        if (!itemsParam) {
            router.push('/cart');
            return;
        }

        const selectedBookIds = itemsParam.split(',').map(id => id.trim()); // Mảng String ID, loại bỏ khoảng trắng
        
        console.log('🛒 CHECKOUT DEBUG:');
        console.log('- Selected Book IDs from URL:', selectedBookIds);

        // 2. Load Profile & Address (Giữ nguyên)
        try {
             const profileRes: any = await userProfileService.getMyProfile();
             const profile = profileRes.data || profileRes;
             if (profile) {
                 setUserId(profile.id || '');
                 setFormData(prev => ({ ...prev, fullName: profile.fullName || '', email: profile.email || '', phone: profile.phoneNumber || '' }));
             }

             const addrRes: any = await addressService.getDefaultAddress();
             const addr = addrRes.data || addrRes;
             if (addr && addr.id) {
                 setDefaultAddress(addr);
                 setUseDefaultAddress(true);
                 setFormData(prev => ({
                    ...prev,
                    fullName: getSafeValue(addr, ['recipientName', 'RecipientName']) || prev.fullName,
                    phone: getSafeValue(addr, ['phoneNumber', 'PhoneNumber']) || prev.phone,
                    address: getSafeValue(addr, ['streetAddress', 'StreetAddress', 'street']) || '',
                    city: getSafeValue(addr, ['province', 'Province']) || '',
                    district: getSafeValue(addr, ['district', 'District']) || '',
                    ward: getSafeValue(addr, ['ward', 'Ward']) || '',
                 }));
             } else { setUseDefaultAddress(false); }
         } catch {}

        // 3. Load Cart & Filter Items
        const cartRes = await cartService.getMyCart();
        const rawItems = Array.isArray(cartRes) ? cartRes : (cartRes as { items?: unknown[] })?.items || [];
        
        console.log('- Total items in cart (backend):', rawItems.length);
        console.log('- All cart items:', rawItems.map((i: any) => ({ id: i.bookId, title: i.bookTitle })));
        
        if (rawItems.length > 0) {
            const enrichedItems = await Promise.all(
                rawItems.map(async (item: any) => {
                    // --- FIX LOGIC: So sánh an toàn (String vs String), loại bỏ khoảng trắng ---
                    const currentBookIdStr = String(item.bookId).trim();
                    
                    console.log(`  Checking item: ${currentBookIdStr} (${item.bookTitle}) - Selected: ${selectedBookIds.includes(currentBookIdStr)}`);
                    
                    // Nếu item này KHÔNG nằm trong danh sách cần mua -> Bỏ qua (return undefined)
                    if (!selectedBookIds.includes(currentBookIdStr)) {
                        console.log(`Skipping item ${currentBookIdStr} - NOT in selected list`);
                        return undefined;
                    }
                    
                    console.log(`Including item ${currentBookIdStr} - IN selected list`);

                    try {
                        const bookDetails = await bookService.getBookById(item.bookId);
                        const priceInfo = resolveBookPrice(bookDetails);
                        return {
                            id: item.id,
                            bookId: item.bookId,
                            title: bookDetails.title || '',
                            author: bookDetails.authors?.[0]?.name || "Tác giả",
                            image: normalizeImageUrl(bookDetails.images?.find((i) => i.isCover)?.imageUrl || bookDetails.images?.[0]?.imageUrl) || '',
                            price: priceInfo.finalPrice,
                            quantity: item.quantity,
                        };
                    } catch { return undefined; }
                })
            );
            
            // Lọc bỏ các giá trị undefined (những món không chọn mua)
            const validItems = enrichedItems.filter((i): i is CheckoutItem => !!i);
            
            console.log('- Valid items for checkout:', validItems.length);
            console.log('- Items to be purchased:', validItems.map(i => ({ id: i.bookId, title: i.title })));
            
            // Nếu URL có ID nhưng lọc xong lại không thấy món nào (do ID sai hoặc item đã bị xóa)
            if (validItems.length === 0) {
                alert("Không tìm thấy sản phẩm hợp lệ để thanh toán.");
                router.push('/cart');
                return;
            }

            setCartItems(validItems);
        }
      } catch (error) {
        console.error("Lỗi init checkout:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, searchParams]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; 
  const estimatedTotal = subtotal + shippingFee;

  const handleInputChange = (e: any) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  // =====================================================================
  // XỬ LÝ ĐẶT HÀNG
  // =====================================================================
  const handlePlaceOrder = async () => {
      if (cartItems.length === 0) return alert("Không có sản phẩm nào để thanh toán");
      
      setIsProcessing(true);
      try {
          // 1. Chuẩn bị dữ liệu địa chỉ (Giữ nguyên)
          let finalAddress = {};
          if(useDefaultAddress && defaultAddress) {
             finalAddress = {
                recipientName: getSafeValue(defaultAddress, ['recipientName']) || formData.fullName,
                phoneNumber: getSafeValue(defaultAddress, ['phoneNumber']) || formData.phone,
                province: getSafeValue(defaultAddress, ['province']) || formData.city,
                district: getSafeValue(defaultAddress, ['district']) || formData.district,
                ward: getSafeValue(defaultAddress, ['ward']) || formData.ward,
                street: getSafeValue(defaultAddress, ['streetAddress']) || formData.address,
                note: formData.note
             };
          } else {
             finalAddress = {
                recipientName: formData.fullName, phoneNumber: formData.phone,
                province: formData.city, district: formData.district, ward: formData.ward,
                street: formData.address, note: formData.note
             };
          }

          const fullAddrStr = `${(finalAddress as any).street}, ${(finalAddress as any).ward}, ${(finalAddress as any).district}, ${(finalAddress as any).province}`;

          const orderPayload = {
            userId,
            items: cartItems.map(i => ({ bookId: i.bookId, quantity: i.quantity, unitPrice: i.price })), 
            address: finalAddress,
            shippingAddress: fullAddrStr,
            note: formData.note,
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BankTransfer'
          };
          
          // 2. Gọi API tạo đơn hàng
          const res: any = await orderService.createOrder(orderPayload as any);
          const orderId = res?.id || res?.orderNumber;
          
          if (!orderId) throw new Error("Không lấy được mã đơn hàng");

          // 3. XÓA CHỈ CÁC SẢN PHẨM ĐÃ MUA KHỎI GIỎ HÀNG (FIXED)
          // Chỉ xóa những sản phẩm vừa thanh toán, giữ lại các sản phẩm khác
          console.log('🗑️ Starting to remove purchased items from cart...');
          console.log('Items to remove:', cartItems.map(i => ({ bookId: i.bookId, title: i.title })));
          
          try {
              for (const item of cartItems) {
                  console.log(`  Removing item: ${item.bookId} (${item.title})`);
                  await cartService.removeCartItem(item.bookId);
                  console.log(`  ✅ Removed: ${item.bookId}`);
              }
              
              // Dispatch event để cập nhật số lượng giỏ hàng ở header
              if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('cartUpdated'));
              }
              
              console.log(`✅ Successfully removed ${cartItems.length} items from cart after checkout`);
          } catch (err) {
              console.error("⚠️ Error removing items from cart:", err);
              // Vẫn tiếp tục chuyển hướng dù có lỗi xóa cart
          }

          // 4. Chuyển hướng đến trang thanh toán
          if(paymentMethod === 'cod') { 
              router.push(`/payment/success?type=cod&orderId=${orderId}`); 
          } else { 
              router.push(`/payment/qr?type=buy&orderId=${orderId}`); 
          }

      } catch(e: any) { 
          alert(e.response?.data?.message || e.message || "Lỗi tạo đơn"); 
          setIsProcessing(false); 
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
         <nav className="mb-6 text-sm text-gray-600">
             <Link href="/" className="hover:text-blue-600">Trang chủ</Link> / 
             <Link href="/cart" className="hover:text-blue-600"> Giỏ hàng</Link> / 
             <span className="font-bold text-gray-900">Thanh toán</span>
         </nav>

         {cartItems.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-xl text-gray-600 mb-4">Không có sản phẩm nào để thanh toán.</p>
                <Link href="/books"><Button>Quay lại mua sắm</Button></Link>
            </div>
         ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* FORM THÔNG TIN */}
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">Thông tin nhận hàng</h2>
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                            <input type="checkbox" checked={useDefaultAddress} onChange={e => setUseDefaultAddress(e.target.checked)} className="w-4 h-4" />
                            <span>Sử dụng địa chỉ mặc định</span>
                        </label>
                        
                        {(!useDefaultAddress || !defaultAddress) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input name="fullName" value={formData.fullName} onChange={handleInputChange} label="Họ tên" required />
                                <Input name="phone" value={formData.phone} onChange={handleInputChange} label="SĐT" required />
                                <Input name="email" value={formData.email} onChange={handleInputChange} label="Email" className="md:col-span-2" required />
                                <Input name="city" value={formData.city} onChange={handleInputChange} label="Tỉnh/Thành" required />
                                <Input name="district" value={formData.district} onChange={handleInputChange} label="Quận/Huyện" required />
                                <Input name="ward" value={formData.ward} onChange={handleInputChange} label="Phường/Xã" required />
                                <Input name="address" value={formData.address} onChange={handleInputChange} label="Địa chỉ" className="md:col-span-2" required />
                            </div>
                        )}
                        <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Ghi chú đơn hàng" className="w-full border p-2 mt-4 rounded" rows={2} />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-4">Thanh toán</h2>
                        <div className="space-y-2">
                           <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                               <input type="radio" name="pay" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="w-5 h-5 text-blue-600" />
                               <div>
                                   <div className="font-bold">Chuyển khoản (QR Code)</div>
                                   <div className="text-xs text-gray-500">Quét mã QR để thanh toán nhanh chóng</div>
                               </div>
                           </label>
                           <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                               <input type="radio" name="pay" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-blue-600" />
                               <div>
                                   <div className="font-bold">Thanh toán khi nhận hàng (COD)</div>
                                   <div className="text-xs text-gray-500">Thanh toán tiền mặt cho shipper</div>
                               </div>
                           </label>
                        </div>
                    </div>
                 </div>

                 {/* SUMMARY */}
                 <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Đơn hàng ({cartItems.length} món)</h2>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-3 text-sm group">
                                    <div className="w-12 h-16 relative border rounded flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {/* Use Next/Image with a safe src and unoptimized for external/presigned URLs */}
                                        {typeof item.image === 'string' && item.image.trim() !== '' ? (
                                            <Image
                                                src={item.image}
                                                alt={item.title || 'Book'}
                                                fill
                                                unoptimized
                                                className="object-cover group-hover:scale-105 transition-transform"
                                                onError={(e) => {
                                                    // If Image fails to load, attempt to replace with fallback by setting the src attribute on the target element
                                                    const target = e?.currentTarget as HTMLImageElement | null;
                                                    if (target) target.src = '/image/anh.png';
                                                }}
                                            />
                                        ) : (
                                            <Image src="/image/anh.png" alt="No image" fill className="object-cover" unoptimized />
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
                                 <span>{formatPrice(subtotal)}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-600">Phí vận chuyển</span>
                                 <span className="text-green-600 font-bold">Miễn phí</span>
                             </div>
                             <div className="flex justify-between font-bold text-xl text-red-600 pt-2 border-t mt-2">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(estimatedTotal)}</span>
                            </div>
                        </div>
                        <Button onClick={handlePlaceOrder} loading={isProcessing} disabled={isProcessing} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 hover:bg-blue-700">
                             {paymentMethod === 'qr' ? 'Thanh toán ngay' : 'Đặt hàng'}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-3">
                            Nhấn đặt hàng đồng nghĩa với việc bạn đồng ý với điều khoản của chúng tôi.
                        </p>
                    </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}