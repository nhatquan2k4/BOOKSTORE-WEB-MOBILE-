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
import { isPhysicalOrder } from '@/lib/order-helper';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Pending: { 
    label: 'Chờ xác nhận', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  Paid: { 
    label: 'Đã thanh toán', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  Shipped: { 
    label: 'Đang giao', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  Completed: { 
    label: 'Giao thành công', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  },
  Cancelled: { 
    label: 'Đã hủy', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  },
};

export default function PhysicalOrdersPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm tải dữ liệu
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Lấy 100 đơn gần nhất để lọc Client-side
      const response = await orderService.getMyOrders({ pageSize: 100 });
      const allItems = response.items || [];

      // 1. Lọc đơn Sách giấy (Physical)
      const physicalOnly = allItems.filter(order => isPhysicalOrder(order));

      setOrders(physicalOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc theo trạng thái (Client-side)
  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'all') return orders;
    return orders.filter(o => o.status === selectedStatus);
  }, [orders, selectedStatus]);

  const getStatusCount = (status: string) => 
    orders.filter(o => o.status === status).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto animate-pulse">
           <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
           <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng Sách giấy</h1>
            <p className="text-gray-500">Quản lý các đơn hàng được vận chuyển đến địa chỉ của bạn.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
            <Button variant={selectedStatus === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setSelectedStatus('all')}>
                Tất cả ({orders.length})
            </Button>
            {Object.entries(statusConfig).map(([key, config]) => (
                <Button 
                    key={key} 
                    variant={selectedStatus === key ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedStatus(key)}
                    className="flex items-center gap-1"
                >
                    {config.label} ({getStatusCount(key)})
                </Button>
            ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Không có đơn hàng nào.</div>
          ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden hover:shadow-md transition">
                  <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center py-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="font-bold">{order.orderNumber}</span>
                            <Badge className={statusConfig[order.status]?.color || 'bg-gray-100'}>
                                {statusConfig[order.status]?.icon}
                                <span className="ml-1">{statusConfig[order.status]?.label || order.status}</span>
                            </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                            Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-red-600 font-bold text-lg">{formatPrice(order.finalAmount)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-14 h-20 border rounded overflow-hidden flex-shrink-0">
                                    <Image src={item.bookImageUrl || '/image/anh.png'} alt={item.bookTitle} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 line-clamp-1">{item.bookTitle}</h4>
                                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                                </div>
                                <div className="text-sm font-medium">{formatPrice(item.unitPrice)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Address & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t pt-4 gap-4">
                        <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-900">Địa chỉ nhận hàng:</p>
                            <p>{order.address.recipientName} - {order.address.phoneNumber}</p>
                            <p>{order.address.fullAddress}</p>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                            {order.status === 'Pending' && (
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={async () => {
                                        if(confirm("Hủy đơn hàng này?")) {
                                            await orderService.cancelOrder(order.id, "User cancelled");
                                            fetchOrders(); // Reload
                                        }
                                    }}
                                >
                                    Hủy đơn
                                </Button>
                            )}
                            <Button onClick={() => router.push(`/account/orders/${order.id}`)}>
                                Xem chi tiết
                            </Button>
                        </div>
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