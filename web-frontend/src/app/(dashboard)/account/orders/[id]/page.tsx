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
import { normalizeImageUrl } from "@/lib/imageUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276';

// --- HELPER 1: Xử lý ảnh (FIX LỖI HIỂN THỊ) ---
const getFullImageUrl = (url?: string | null) => {
  if (!url || url.trim() === "") return '/image/anh.png';
  if (url.startsWith('http')) return url;
  
  // 1. Đổi dấu gạch ngược \ thành / (Fix lỗi Windows path)
  let cleanUrl = url.replace(/\\/g, '/');
  
  // 2. Đảm bảo bắt đầu bằng /
  if (!cleanUrl.startsWith('/')) {
      cleanUrl = `/${cleanUrl}`;
  }

  // 3. Ghép với domain backend
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBase}${cleanUrl}`;
};

// ... Các helper khác giữ nguyên ...
const getSafeValue = (obj: any, keys: string[], defaultVal: any = undefined) => {
    if (!obj) return defaultVal;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
    }
    return defaultVal;
};

const getOrderInfo = (order: any) => {
    if (!order) return { name: "", phone: "", address: "" };
    const addr = order.address || order.Address || {};
    const root = order;
    const name = getSafeValue(addr, ['recipientName', 'RecipientName', 'fullName', 'FullName']) || 
                 getSafeValue(root, ['recipientName', 'RecipientName', 'userName', 'UserName']) || "Khách hàng";
    const phone = getSafeValue(addr, ['phoneNumber', 'PhoneNumber', 'phone', 'Phone']) || 
                  getSafeValue(root, ['phoneNumber', 'PhoneNumber', 'userPhone']) || "";
    let address = "";
    const street = getSafeValue(addr, ['street', 'Street', 'streetAddress', 'StreetAddress']) || getSafeValue(root, ['shippingAddress', 'ShippingAddress']);
    const ward = getSafeValue(addr, ['ward', 'Ward']);
    const district = getSafeValue(addr, ['district', 'District']);
    const province = getSafeValue(addr, ['province', 'Province', 'city', 'City']);
    if (province) address = [street, ward, district, province].filter(Boolean).join(', ');
    else address = street || "Chưa có thông tin địa chỉ";
    return { name, phone, address };
};

const getPaymentMethodText = (method: any) => {
    if (!method) return "Chưa xác định";
    const m = String(method).toLowerCase().trim();
    if (m === 'cod' || m.includes('cash')) return 'Thanh toán khi nhận hàng (COD)';
    if (m === 'banktransfer' || m.includes('bank') || m.includes('qr') || m.includes('transfer')) return 'Chuyển khoản Ngân hàng (QR)';
    return method;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (error || !order) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4"><p className="text-red-600 font-medium">{error || "Không tìm thấy đơn hàng"}</p><Button onClick={() => router.push('/account/orders')}>Quay lại danh sách</Button></div>;

  const info = getOrderInfo(order);
  const finalTotal = getSafeValue(order, ['finalAmount', 'FinalAmount', 'totalAmount', 'TotalAmount'], 0);
  const shippingFee = getSafeValue(order, ['shippingFee', 'ShippingFee'], 0);
  const discountAmount = getSafeValue(order, ['discountAmount', 'DiscountAmount'], 0);
  const orderNumber = getSafeValue(order, ['orderNumber', 'OrderNumber', 'id']);
  const paymentMethodText = getPaymentMethodText(getSafeValue(order, ['paymentMethod', 'PaymentMethod', 'paymentType', 'PaymentType']));
  const createdAtRaw = getSafeValue(order, ['createdAt', 'CreatedAt']);
  const createdAt = createdAtRaw ? new Date(createdAtRaw).toLocaleString("vi-VN") : "N/A";
  const items = getSafeValue(order, ['items', 'Items'], []);
  const statusLogs = getSafeValue(order, ['statusLogs', 'StatusLogs'], []);
  const status = getSafeValue(order, ['status', 'Status'], 'Unknown');

  const renderStatus = () => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'Completed': { label: 'Hoàn thành', className: 'bg-green-100 text-green-700 border-green-200' },
      'Paid': { label: 'Đã thanh toán', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      'Pending': { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'Cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-700 border-red-200' },
      'Shipped': { label: 'Đang giao hàng', className: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    const s = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return <Badge className={`px-3 py-1 text-sm font-medium border ${s.className}`}>{s.label}</Badge>;
  };

  // Small resilient image component with onError fallback
  function BookImage({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
    const [imgSrc, setImgSrc] = useState<string>(src && src.trim() !== '' ? src : '/image/anh.png');
    useEffect(() => {
      setImgSrc(src && src.trim() !== '' ? src : '/image/anh.png');
    }, [src]);
    return (
      <Image src={imgSrc} alt={alt || 'Book'} fill className={className} unoptimized onError={() => setImgSrc('/image/anh.png')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button variant="ghost" onClick={() => router.push('/account/orders')} className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600 transition-colors">
          ← Quay lại danh sách
        </Button>

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{orderNumber}</h1>
                {renderStatus()}
              </div>
              <p className="text-sm text-gray-500">Ngày đặt: {createdAt}</p>
            </div>
            
            <div className="flex gap-3">
               {status === "Pending" && (
                 <Button onClick={() => router.push(`/payment/qr?type=buy&orderId=${order.id || orderNumber}&amount=${finalTotal}`)}>
                   Thanh toán ngay
                 </Button>
               )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-base">Sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {items.map((item: any) => {
                    const imageUrl = normalizeImageUrl(item.bookImageUrl || item.BookImageUrl);
                    return (
                      <div key={item.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                        <div className="relative w-20 h-28 border rounded-md overflow-hidden flex-shrink-0">
                          <BookImage src={imageUrl} alt="Book" className="object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.bookTitle || item.BookTitle}</h3>
                            <p className="text-sm text-gray-500 mt-1">Số lượng: x{item.quantity || item.Quantity}</p>
                          </div>
                          <div className="text-right">
                              <span className="font-bold text-gray-900">{formatPrice(item.unitPrice || item.UnitPrice)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {statusLogs.length > 0 && (
              <Card>
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-base">Lịch sử đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                    {statusLogs.map((log: any, index: number) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className={`font-medium ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{log.status || log.Status}</p>
                          <p className="text-xs text-gray-500">{new Date(log.timestamp || log.Timestamp).toLocaleString("vi-VN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
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
                        <p className="font-medium text-gray-900">{info.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Điện thoại</p>
                        <p className="font-medium text-gray-900">{info.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="text-gray-900 leading-relaxed">{info.address}</p>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-base">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="font-bold text-blue-700">{paymentMethodText}</span>
                </div>
                <div className="border-t border-dashed my-2"></div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">{formatPrice(Number(finalTotal) - Number(shippingFee))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    {Number(shippingFee) > 0 ? (
                        <span className="text-gray-900">{formatPrice(shippingFee)}</span>
                    ) : (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                    )}
                  </div>
                  {Number(discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-red-600">{formatPrice(finalTotal)}</span>
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