'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { orderService } from '@/services';
import { formatPrice } from '@/lib/price';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276';

// --- HELPER 1: Xử lý ảnh chuẩn ---
const getFullImageUrl = (url?: string | null) => {
  if (!url || url.trim() === "") return null;
  if (url.startsWith('http')) return url;
  let cleanUrl = url.replace(/\\/g, '/');
  if (!cleanUrl.startsWith('/')) cleanUrl = `/${cleanUrl}`;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBase}${cleanUrl}`;
};

const NoImagePlaceholder = () => (
  <div className="w-full h-full bg-gray-100 flex items-center justify-center border rounded">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// --- HELPER 2: Xử lý địa chỉ ---
const getOrderInfo = (order: any) => {
    const addr = order.address || order.Address || {};
    const root = order;
    const name = addr.recipientName || addr.RecipientName || root.recipientName || root.RecipientName || "Khách hàng";
    const phone = addr.phoneNumber || addr.PhoneNumber || root.phoneNumber || root.PhoneNumber || "";
    
    let fullAddress = "";
    const street = addr.street || addr.Street || addr.streetAddress || addr.StreetAddress || root.shippingAddress || root.ShippingAddress;
    const ward = addr.ward || addr.Ward;
    const district = addr.district || addr.District;
    const province = addr.province || addr.Province || addr.city || addr.City;

    if (province) {
        fullAddress = [street, ward, district, province].filter(Boolean).join(', ');
    } else {
        fullAddress = street || "Chưa cập nhật địa chỉ";
    }
    return { name, phone, address: fullAddress };
};

// --- CONFIG MÀU SẮC TRẠNG THÁI (Đã mở rộng thêm key) ---
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  // Chờ xác nhận
  Pending: { 
    label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  
  // Đã xác nhận / Đã thanh toán
  Paid: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: null },
  Confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: null },
  Processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: null },

  // Đang giao
  Shipped: { 
    label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  Delivering: { 
    label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },

  // Đã giao
  Completed: { 
    label: 'Đã giao', color: 'bg-green-100 text-green-700 border-green-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  },
  Delivered: { 
    label: 'Đã giao', color: 'bg-green-100 text-green-700 border-green-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  },
  Success: { 
    label: 'Thành công', color: 'bg-green-100 text-green-700 border-green-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  },

  // Hủy
  Cancelled: { 
    label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  },
};

// Định nghĩa Tabs
const ORDER_TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipped', label: 'Đang giao' },
    { id: 'completed', label: 'Đã giao' },
    { id: 'cancelled', label: 'Hủy' },
];

// --- LOGIC LỌC THÔNG MINH (QUAN TRỌNG) ---
// Hàm này kiểm tra xem đơn hàng có thuộc Tab đang chọn không
const checkStatusMatch = (orderStatus: string, tabId: string) => {
    if (!orderStatus) return false;
    const s = orderStatus.toLowerCase().trim();
    const t = tabId.toLowerCase();

    if (t === 'all') return true;

    // 1. Chờ xác nhận
    if (t === 'pending') {
        return s === 'pending' || s === 'created' || s === 'awaitingpayment';
    }
    // 2. Đã xác nhận (Bao gồm Paid, Confirmed, Processing)
    if (t === 'confirmed') {
        return s === 'paid' || s === 'confirmed' || s === 'processing';
    }
    // 3. Đang giao (Shipped, Delivering, InTransit)
    if (t === 'shipped') {
        return s === 'shipped' || s === 'delivering' || s === 'shipping' || s === 'intransit' || s === 'onway';
    }
    // 4. Đã giao (Completed, Delivered, Success)
    if (t === 'completed') {
        return s === 'completed' || s === 'delivered' || s === 'success' || s === 'done';
    }
    // 5. Hủy
    if (t === 'cancelled') {
        return s === 'cancelled' || s === 'canceled' || s === 'failed' || s === 'rejected';
    }

    return s === t;
};

// Separate component that uses useSearchParams
function PhysicalOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders({ pageSize: 100 });
      console.log("📦 Dữ liệu đơn hàng gốc:", response); // Log để check status thật
      const allItems = response.items || [];
      setOrders(allItems);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { if (searchParams.get('refresh') === '1') fetchOrders(); }, [searchParams]);

  // Logic lọc đơn hàng dựa trên hàm checkStatusMatch
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
        const status = o.status || o.Status;
        return checkStatusMatch(status, selectedStatus);
    });
  }, [orders, selectedStatus]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h1>
            <p className="text-gray-500">Theo dõi trạng thái và lịch sử mua sắm.</p>
        </div>

        {/* --- TABS LỌC TRẠNG THÁI --- */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-200 overflow-x-auto">
            {ORDER_TABS.map((tab) => {
                const isActive = selectedStatus === tab.id;
                // Đếm số lượng đơn cho từng tab
                const count = orders.filter(o => checkStatusMatch(o.status || o.Status, tab.id)).length;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedStatus(tab.id)}
                        className={`
                            relative px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap
                            ${isActive 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }
                        `}
                    >
                        {tab.label}
                        <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>

        {/* --- DANH SÁCH ĐƠN HÀNG --- */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-dashed shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">Không có đơn hàng nào</p>
                  <p className="text-gray-500 text-sm mb-6">Ở trạng thái này bạn chưa có đơn hàng nào.</p>
                  <Button onClick={() => router.push('/books')}>Khám phá sách hay</Button>
              </div>
          ) : (
              filteredOrders.map((order) => {
                const info = getOrderInfo(order);
                const finalAmount = order.finalAmount || order.FinalAmount || order.totalAmount || 0;
                const orderNum = order.orderNumber || order.OrderNumber || order.id;
                const status = order.status || order.Status;
                
                // Config hiển thị status (Default về trạng thái gốc nếu không tìm thấy trong config)
                const s = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };

                return (
                <Card key={order.id} className="overflow-hidden hover:shadow-md transition border-gray-200">
                  {/* Header Card */}
                  <CardHeader className="bg-gray-50/80 border-b flex flex-col sm:flex-row justify-between sm:items-center py-3 px-4 gap-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 text-base">{orderNum}</span>
                            <Badge className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${s.color}`}>
                                {s.icon}
                                <span>{s.label}</span>
                            </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                            Ngày đặt: {new Date(order.createdAt || order.CreatedAt).toLocaleString('vi-VN')}
                        </span>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Tổng tiền</span>
                        <div className="text-red-600 font-bold text-lg">{formatPrice(finalAmount)}</div>
                    </div>
                  </CardHeader>

                  {/* Body Card */}
                  <CardContent className="p-4">
                    {/* List Items */}
                    <div className="space-y-4 mb-5">
                        {(order.items || order.Items || []).map((item: any) => {
                            const imageUrl = getFullImageUrl(item.bookImageUrl || item.BookImageUrl);
                            return (
                                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => router.push(`/account/orders/${order.id}`)}>
                                    <div className="relative w-16 h-24 border rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
                                        {imageUrl ? (
                                            <Image 
                                                src={imageUrl} 
                                                alt="Book" 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform" 
                                                unoptimized
                                            />
                                        ) : (
                                            <NoImagePlaceholder />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                                            {item.bookTitle || item.BookTitle}
                                        </h4>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm text-gray-500">x{item.quantity || item.Quantity}</p>
                                            <p className="text-sm font-semibold text-gray-900">{formatPrice(item.unitPrice || item.UnitPrice)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Card: Address & Action */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t pt-4 gap-4">
                        <div className="text-sm text-gray-600 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium text-gray-900">Địa chỉ nhận hàng:</span>
                            </div>
                            <div className="pl-6">
                                <span className="font-bold text-gray-800">{info.name}</span> 
                                {info.phone && <span className="text-gray-500"> • {info.phone}</span>}
                                <p className="text-gray-500 mt-0.5 line-clamp-1">{info.address}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                            {/* Nút thanh toán chỉ hiện khi trạng thái là Pending */}
                            {checkStatusMatch(status, 'pending') && (
                                <Button 
                                    size="sm" 
                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/payment/qr?type=buy&orderId=${order.id}&amount=${finalAmount}`);
                                    }}
                                >
                                    Thanh toán
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 sm:flex-none"
                                onClick={() => router.push(`/account/orders/${order.id}`)}
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              )})
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function OrdersLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PhysicalOrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <PhysicalOrdersContent />
    </Suspense>
  );
}