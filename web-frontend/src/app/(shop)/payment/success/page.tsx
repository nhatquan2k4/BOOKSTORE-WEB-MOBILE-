'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, BookOpen, Truck, ClipboardList, Info, Mail, Bell, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  // Lấy các tham số từ URL
  const type = searchParams.get('type'); // 'rent', 'buy', hoặc 'cod'
  const bookId = searchParams.get('bookId');
  const orderId = searchParams.get('orderId') || `ORD${Date.now()}`;

  // Kiểm tra xem đây có phải đơn hàng vật lý (Sách giấy/COD) không
  const isPhysicalOrder = type === 'buy' || type === 'cod';

  // --- LOGIC ĐẾM NGƯỢC & CHUYỂN TRANG AN TOÀN ---
  useEffect(() => {
    // Chỉ tự động chuyển hướng với đơn hàng vật lý
    if (isPhysicalOrder) {
      // Nếu đếm ngược về 0 thì mới chuyển trang
      if (countdown === 0) {
        router.push('/account/orders/physical?refresh=1');
        return;
      }

      // Thiết lập timer đếm ngược mỗi 1 giây
      const timerId = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      // Dọn dẹp timer khi component unmount hoặc update
      return () => clearTimeout(timerId);
    }
  }, [countdown, isPhysicalOrder, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: type === 'rent' ? 'Thuê eBook' : 'Thanh toán' },
        { label: 'Thành công' }
      ]} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            
            {/* Success Animation */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-16 h-16 text-white animate-bounce" strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {type === 'cod' ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
            </h1>
            
            <p className="text-gray-600 mb-2">
              Mã đơn hàng: <span className="font-semibold text-gray-900 font-mono">{orderId}</span>
            </p>

            {/* Thông báo đếm ngược cho đơn hàng vật lý */}
            {isPhysicalOrder && countdown > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 mb-6 transition-all">
                <p className="text-sm text-blue-800">
                  Tự động chuyển đến danh sách đơn hàng trong <span className="font-bold text-blue-900 text-lg">{countdown}</span> giây...
                </p>
              </div>
            )}

            {/* --- NỘI DUNG KHÁC NHAU TÙY LOẠI ĐƠN --- */}
            {type === 'rent' ? (
              // Giao diện cho thuê sách (E-book)
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      eBook đã được thêm vào thư viện
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Bạn có thể bắt đầu đọc ngay bây giờ. Sách sẽ có sẵn trong thời gian thuê của bạn.
                    </p>
                    <Badge variant="success" className="bg-green-500 text-white border-none">
                      <Check className="w-3.5 h-3.5 inline-block mr-1" />
                      Đã kích hoạt
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              // Giao diện cho mua sách giấy (Buy / COD)
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 my-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Đơn hàng đang được xử lý
                    </h3>
                    <p className="text-sm text-purple-800 mb-3">
                      {type === 'cod' 
                        ? 'Vui lòng chuẩn bị tiền mặt và chú ý điện thoại khi shipper liên hệ.' 
                        : 'Chúng tôi sẽ giao hàng trong 2-3 ngày làm việc. Bạn sẽ nhận được email xác nhận.'
                      }
                    </p>
                    <Badge variant="info" className="bg-blue-500 text-white border-none">
                      Đang chuẩn bị hàng
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-center mb-2">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Email xác nhận</p>
                <p className="text-xs text-gray-600">Đã gửi đến hộp thư</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-center mb-2">
                  <Bell className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Thông báo</p>
                <p className="text-xs text-gray-600">Cập nhật trạng thái</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-center mb-2">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Hóa đơn</p>
                <p className="text-xs text-gray-600">Đã lưu vào tài khoản</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {type === 'rent' ? (
                <>
                  <Link href="/account/library">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 h-auto">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Mở thư viện
                    </Button>
                  </Link>
                  {bookId && (
                    <Link href={`/rent/${bookId}`}>
                      <Button variant="outline" className="w-full sm:w-auto px-8 py-3 h-auto">
                        Xem chi tiết sách
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/account/orders/physical">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 h-auto">
                      <ClipboardList className="w-5 h-5 mr-2" />
                      Xem đơn hàng ({countdown})
                    </Button>
                  </Link>
                  <Link href="/books">
                    <Button variant="outline" className="w-full sm:w-auto px-8 py-3 h-auto">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <Link href="/" className="inline-flex items-center gap-1 mt-6 text-sm text-gray-600 hover:text-blue-600 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Về trang chủ
            </Link>
          </div>

          {/* Additional Info Footer */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Điều gì tiếp theo?
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Bạn sẽ nhận được email xác nhận trong vài phút</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>
                  {type === 'rent' 
                    ? 'eBook sẵn sàng để đọc trên mọi thiết bị' 
                    : 'Theo dõi hành trình đơn hàng trong mục "Đơn hàng của tôi"'
                  }
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Cần hỗ trợ? Liên hệ CSKH 24/7: <strong>1900-xxxx</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}