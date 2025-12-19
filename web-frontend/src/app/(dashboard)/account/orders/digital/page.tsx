'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { orderService } from '@/services';
import type { OrderDto } from '@/types/dtos';
import { formatPrice } from '@/lib/price';
import { isDigitalOrder } from '@/lib/order-helper'; // Import hàm lọc

// Config trạng thái cho Ebook (ít hơn sách giấy)
const statusConfig: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700' },
  Paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' }, // Với Ebook, Paid = Completed
  Completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  Cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function DigitalOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrders({ pageSize: 100 });
        const allItems = response.items || [];

        // 1. Lọc đơn E-Book (Digital)
        const digitalOnly = allItems.filter(order => isDigitalOrder(order));

        setOrders(digitalOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReadOnline = (bookId: string) => {
    // Chuyển sang trang đọc
    router.push(`/reader/${bookId}`); // API Order chưa trả BookId trực tiếp ở cấp Order, phải lấy trong Items
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Đang tải thư viện số...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* Header */}
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng E-Book</h1>
            <p className="text-gray-500">Sách điện tử bạn đã mua và có thể đọc ngay.</p>
        </div>

        {/* Orders List */}
        <div className="grid gap-6">
          {orders.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">Bạn chưa mua cuốn E-Book nào.</p>
                  <Button className="mt-4" onClick={() => router.push('/rent')}>Khám phá E-Book</Button>
              </div>
          ) : (
              orders.map((order) => (
                <Card key={order.id} className="overflow-hidden border hover:shadow-md transition">
                  <CardHeader className="bg-purple-50 border-b flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-purple-900">{order.orderNumber}</span>
                        <Badge className={statusConfig[order.status]?.color || 'bg-gray-100'}>
                            {statusConfig[order.status]?.label || order.status}
                        </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </CardHeader>

                  <CardContent className="p-5">
                    {/* Mỗi Order có thể có nhiều sách */}
                    <div className="space-y-6">
                        {order.items.map(item => (
                            <div key={item.id} className="flex gap-5 items-start">
                                <div className="relative w-20 h-28 rounded-md overflow-hidden shadow-sm flex-shrink-0">
                                    <Image src={item.bookImageUrl || '/image/anh.png'} alt={item.bookTitle} fill className="object-cover" />
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.bookTitle}</h3>
                                    <p className="text-sm text-gray-600 mb-2">ISBN: {item.bookISBN}</p>
                                    
                                    {/* Action Buttons cho từng sách */}
                                    <div className="flex gap-2 mt-3">
                                        {(order.status === 'Paid' || order.status === 'Completed') ? (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                    onClick={() => router.push(`/books/${item.bookId}/read`)}
                                                >
                                                    Đọc ngay
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    Tải PDF
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-sm text-orange-600 italic">
                                                Thanh toán để mở khóa nội dung
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <span className="font-bold text-gray-700">{formatPrice(item.unitPrice)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  );
}