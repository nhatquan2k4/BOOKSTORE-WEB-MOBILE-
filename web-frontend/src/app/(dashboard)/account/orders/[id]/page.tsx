"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { orderService } from "@/services";
import { formatPrice } from "@/lib/price";

// --- CONFIG & HELPERS ---
const API_BASE_URL = 'http://localhost:5276';

const getFullImageUrl = (url?: string | null) => {
  if (!url) return '/image/anh.png';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Helper tính ngày hết hạn
const calculateExpiryDate = (startDate: string, days: number) => {
  if (!startDate || !days) return null;
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date;
};

// Interface
interface OrderDetailType {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  type: "Physical" | "Digital" | "Rental";
  paymentMethod: string;
  
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;

  recipientName?: string;
  phoneNumber?: string;
  shippingAddress?: string;
  note?: string;

  rentalDurationDays?: number; 
  rentalStartDate?: string;

  address?: {
    recipientName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    province: string;
    note?: string;
  };

  items: {
    id: string;
    bookId: string;
    bookTitle: string;
    bookISBN: string;
    bookImageUrl?: string;
    quantity: number;
    unitPrice: number;
    rentalDays?: number; 
  }[];

  statusLogs?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        setOrder(data as unknown as OrderDetailType);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetail();
  }, [orderId]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !order) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4"><p className="text-red-600 font-medium">{error || "Không tìm thấy đơn hàng"}</p><Button onClick={() => router.push('/account/orders')}>Quay lại danh sách</Button></div>;

  // --- LOGIC ---
  const isRental = order.type === "Rental" || order.orderNumber.startsWith("RENT") || order.items.some(i => (i.rentalDays || 0) > 0);
  const isDigital = isRental || order.type === "Digital"; 
  
  // Check xem đơn hàng đã hoàn thành/thanh toán chưa để hiện nút đọc
  const canRead = order.status === 'Paid' || order.status === 'Completed';

  // Phí ship
  let calculatedShippingFee = 0;
  if (!isDigital) {
      calculatedShippingFee = order.totalAmount >= 500000 ? 0 : 30000;
  }
  const calculatedFinalAmount = order.totalAmount + calculatedShippingFee - (order.discountAmount || 0);

  // Địa chỉ
  const recipientName = order.recipientName || order.address?.recipientName || "N/A";
  const recipientPhone = order.phoneNumber || order.address?.phoneNumber || "N/A";
  const fullAddressStr = order.address 
    ? `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
    : `${order.shippingAddress || ''}`;

  // Render Status Badge
  const renderStatus = () => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'Completed': { label: 'Hoàn thành', className: 'bg-green-100 text-green-700 border-green-200' },
      'Paid': { label: 'Đã thanh toán', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      'Pending': { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'Cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-700 border-red-200' },
      'Expired': { label: 'Đã hết hạn thuê', className: 'bg-gray-100 text-gray-600 border-gray-300' }
    };
    const s = statusMap[order.status] || { label: order.status, className: 'bg-gray-100 text-gray-700' };
    return <Badge className={`px-3 py-1 text-sm font-medium border ${s.className}`}>{s.label}</Badge>;
  };

  const handleReadOnline = (bookId: string) => {
    // Điều hướng sang trang đọc sách
    router.push(`/books/${bookId}/read`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <Button variant="ghost" onClick={() => router.push('/account/orders')} className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600 transition-colors">
          ← Quay lại danh sách đơn hàng
        </Button>

        {/* HEADER SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.orderNumber}</h1>
                {renderStatus()}
                {isRental && <Badge className="bg-purple-100 text-purple-700 border-purple-200">Thuê sách</Badge>}
              </div>
              <p className="text-sm text-gray-500">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            
            <div className="flex gap-3">
               {/* 1. NÚT THANH TOÁN (Nếu chưa trả tiền) */}
               {order.status === "Pending" && (
                 <Button onClick={() => router.push(`/payment/qr?type=${isRental ? 'rent' : 'buy'}&orderId=${order.orderNumber}&amount=${calculatedFinalAmount}`)}>
                   Thanh toán ngay
                 </Button>
               )}

               {/* 2. NÚT VÀO THƯ VIỆN (QUAN TRỌNG: Chỉ hiện khi đã mua/thuê xong) */}
               {canRead && isDigital && (
                 <Button 
                    onClick={() => router.push('/account/library')}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    Vào thư viện sách
                 </Button>
               )}

               {/* 3. Nút Gia hạn (Nếu sắp hết hạn) */}
               {isRental && (order.status === 'Expired') && (
                 <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                    Gia hạn thuê
                 </Button>
               )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Products List */}
            <Card>
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => {
                    const imageUrl = getFullImageUrl(item.bookImageUrl);
                    const days = item.rentalDays || order.rentalDurationDays || 30; 
                    const startDate = order.rentalStartDate || order.createdAt;
                    const expiryDate = calculateExpiryDate(startDate, days);
                    const isExpired = expiryDate ? new Date() > expiryDate : false;

                    return (
                      <div key={item.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                        <div className="relative w-20 h-28 border rounded-md overflow-hidden flex-shrink-0">
                          <Image src={imageUrl} alt={item.bookTitle} fill className="object-cover" />
                          {isRental && (
                            <div className="absolute bottom-0 w-full bg-purple-600 text-white text-[10px] text-center py-0.5 font-bold">
                                {days} NGÀY
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.bookTitle}</h3>
                            {isRental ? (
                                <div className="mt-1 flex flex-col gap-1">
                                    <p className="text-xs text-gray-500">Gói thuê: <span className="font-medium text-gray-900">{days} ngày</span></p>
                                    {canRead && expiryDate && (
                                        <p className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                            {isExpired ? `Đã hết hạn vào ${expiryDate.toLocaleDateString('vi-VN')}` : `Hết hạn: ${expiryDate.toLocaleDateString('vi-VN')}`}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-1">Số lượng: x{item.quantity}</p>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-end mt-2">
                            <div className="text-right ml-auto flex flex-col items-end gap-2">
                              <div className="font-bold text-gray-900">{formatPrice(item.unitPrice)}</div>
                              
                              {/* --- NÚT ĐỌC NGAY CHO TỪNG SÁCH --- */}
                              {isDigital && canRead && !isExpired && (
                                <Button 
                                  onClick={() => handleReadOnline(item.bookId)} 
                                  size="sm" 
                                  className="h-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
                                >
                                  <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                  Đọc ngay
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Logs */}
            {order.statusLogs && order.statusLogs.length > 0 && (
              <Card>
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-base">Lịch sử đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                    {order.statusLogs.map((log, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className={`font-medium ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{log.status}</p>
                          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString("vi-VN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* THẺ THÔNG TIN THUÊ */}
            {isRental ? (
                <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="border-b border-purple-100 bg-purple-50">
                        <CardTitle className="text-base flex items-center gap-2 text-purple-900">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Thông tin gói thuê
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Thời hạn:</span>
                            <span className="font-medium">{order.rentalDurationDays || order.items[0]?.rentalDays || 30} ngày</span>
                        </div>
                        {canRead ? (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Bắt đầu:</span>
                                    <span className="font-medium">{new Date(order.rentalStartDate || order.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Hết hạn:</span>
                                    <span className="font-bold text-red-600">
                                        {calculateExpiryDate(order.rentalStartDate || order.createdAt, order.rentalDurationDays || 30)?.toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                Thời hạn thuê sẽ tính từ lúc thanh toán thành công.
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : !isDigital && (
                // THẺ ĐỊA CHỈ (Physical)
                <Card>
                    <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        Địa chỉ nhận hàng
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                    <div className="space-y-3">
                        <div>
                        <p className="text-sm text-gray-500">Người nhận</p>
                        <p className="font-medium text-gray-900">{recipientName}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Điện thoại</p>
                        <p className="font-medium text-gray-900">{recipientPhone}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="text-gray-900 leading-relaxed">
                            {fullAddressStr.replace(/^, /, '').replace(/, ,/g, ',') || "Chưa có thông tin địa chỉ"}
                        </p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment & Summary */}
            <Card>
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-base">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="font-medium">{order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản QR' : 'COD - Tiền mặt'}</span>
                </div>
                <div className="border-t border-dashed my-2"></div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">{formatPrice(order.totalAmount || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    {isDigital ? (
                        <span className="text-gray-400 decoration-dashed">Không áp dụng</span>
                    ) : calculatedShippingFee > 0 ? (
                        <span className="text-gray-900">{formatPrice(calculatedShippingFee)}</span>
                    ) : (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                    )}
                  </div>

                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatPrice(calculatedFinalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Link href="/contact" className="text-sm text-blue-600 hover:underline">
                Cần hỗ trợ về đơn hàng này?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}