'use client';

import { useState, useEffect } from 'react';
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

interface PhysicalOrder {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: {
    id: number;
    title: string;
    cover: string;
    price: number;
    quantity: number;
    author: string;
  }[];
}

const mockPhysicalOrders: PhysicalOrder[] = [
  {
    id: 'PHY-2024-001',
    date: '2024-11-05',
    status: 'delivered',
    total: 550000,
    shippingAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    trackingNumber: 'VN1234567890',
    items: [
      {
        id: 1,
        title: 'Clean Code',
        cover: '/image/anh.png',
        price: 350000,
        quantity: 1,
        author: 'Robert C. Martin',
      },
      {
        id: 2,
        title: 'Design Patterns',
        cover: '/image/anh.png',
        price: 200000,
        quantity: 1,
        author: 'Gang of Four',
      },
    ],
  },
  {
    id: 'PHY-2024-002',
    date: '2024-11-06',
    status: 'shipping',
    total: 320000,
    shippingAddress: '456 Lê Văn Việt, Quận 9, TP.HCM',
    trackingNumber: 'VN0987654321',
    estimatedDelivery: '2024-11-10',
    items: [
      {
        id: 3,
        title: 'The Pragmatic Programmer',
        cover: '/image/anh.png',
        price: 320000,
        quantity: 1,
        author: 'Andrew Hunt',
      },
    ],
  },
  {
    id: 'PHY-2024-003',
    date: '2024-11-07',
    status: 'processing',
    total: 450000,
    shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM',
    estimatedDelivery: '2024-11-12',
    items: [
      {
        id: 4,
        title: 'Refactoring',
        cover: '/image/anh.png',
        price: 290000,
        quantity: 1,
        author: 'Martin Fowler',
      },
      {
        id: 5,
        title: "You Don't Know JS",
        cover: '/image/anh.png',
        price: 160000,
        quantity: 1,
        author: 'Kyle Simpson',
      },
    ],
  },
  {
    id: 'PHY-2024-004',
    date: '2024-11-03',
    status: 'pending',
    total: 280000,
    shippingAddress: '321 Hoàng Diệu, Quận 4, TP.HCM',
    items: [
      {
        id: 6,
        title: 'JavaScript: The Good Parts',
        cover: '/image/anh.png',
        price: 280000,
        quantity: 1,
        author: 'Douglas Crockford',
      },
    ],
  },
  {
    id: 'PHY-2024-005',
    date: '2024-11-08',
    status: 'shipping',
    total: 690000,
    shippingAddress: '555 Trần Hưng Đạo, Quận 1, TP.HCM',
    trackingNumber: 'VN1122334455',
    estimatedDelivery: '2024-11-11',
    items: [
      {
        id: 7,
        title: 'Introduction to Algorithms',
        cover: '/image/anh.png',
        price: 690000,
        quantity: 1,
        author: 'CLRS',
      },
    ],
  },
];

const statusConfig: Record<
  PhysicalOrder['status'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6v6l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.9-2.9" />
        <path d="M18 12h4" />
        <path d="m16.2 16.2 2.9 2.9" />
        <path d="M12 18v4" />
        <path d="m4.9 19.1 2.9-2.9" />
        <path d="M2 12h4" />
        <path d="m4.9 4.9 2.9 2.9" />
      </svg>
    ),
  },
  shipping: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    ),
  },
  delivered: {
    label: 'Đã giao',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </svg>
    ),
  },
};

export default function PhysicalOrdersPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<'all' | PhysicalOrder['status']>('all');
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
        const response = await orderService.getMyOrders({ ...params, pageSize: 50 });
        setOrders(response.items || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedStatus]);

  const filteredOrders = orders;

  const getStatusCount = (status: string) => 
    orders.filter(o => o.status.toLowerCase() === status.toLowerCase()).length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header giống eBook: nút back + icon + title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/account/orders')}
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Đơn hàng sách giấy
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi đơn hàng sách vật lý
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Tổng đơn</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {getStatusCount('pending')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Chờ xác nhận</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {getStatusCount('processing')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Đang xử lý</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {getStatusCount('shipping')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Đang giao</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {getStatusCount('delivered')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Đã giao</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex gap-2 flex-wrap p-2">
            <Button
              variant={selectedStatus === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              Tất cả ({orders.length})
            </Button>
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = getStatusCount(key);
              return (
                <Button
                    key={key}
                    variant={selectedStatus === key ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() =>
                      setSelectedStatus(key as PhysicalOrder['status'])
                    }
                    className="flex items-center gap-2"
                  >
                    {config.icon}
                    {config.label} ({count})
                  </Button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{order.orderNumber}</CardTitle>
                      <Badge
                        variant="default"
                        className={`flex items-center gap-1 border ${
                          statusConfig[order.status.toLowerCase() as PhysicalOrder['status']]?.color || 'bg-gray-100'
                        }`}
                      >
                        {statusConfig[order.status.toLowerCase() as PhysicalOrder['status']]?.icon}
                        {statusConfig[order.status.toLowerCase() as PhysicalOrder['status']]?.label || order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {/* date */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 2v4" />
                          <path d="M16 2v4" />
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                          <path d="M3 10h18" />
                        </svg>
                        <span>
                          Đặt ngày:{' '}
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
                          <circle cx="12" cy="8" r="2" />
                          <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
                        </svg>
                        <span className="line-clamp-1">
                          {order.address.recipientName} - {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{order.address.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                    className="flex items-center gap-1"
                  >
                    Chi tiết
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0 shadow-sm">
                        <Image
                          src={item.bookImageUrl || '/images/book-placeholder.png'}
                          alt={item.bookTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.bookTitle}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          ISBN: {item.bookISBN}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Số lượng: x{item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.unitPrice.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Tổng: {item.subtotal.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer actions giống eBook kiểu tách theo trạng thái */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    {order.discountAmount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Giảm giá:</span>
                        <span className="text-green-600 font-medium">
                          -{order.discountAmount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    {order.shippingFee > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Phí ship:</span>
                        <span className="font-medium">
                          {order.shippingFee.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-600">
                        Tổng thanh toán:
                      </span>
                      <span className="font-bold text-blue-600 text-xl">
                        {order.finalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {order.status.toLowerCase() === 'delivered' && (
                      <>
                        <Button variant="outline" size="sm">
                          Mua lại
                        </Button>
                        <Button variant="ghost" size="sm">
                          Đánh giá
                        </Button>
                      </>
                    )}

                    {(order.status.toLowerCase() === 'pending' ||
                      order.status.toLowerCase() === 'processing') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                            try {
                              await orderService.cancelOrder(order.id);
                              alert('Đã hủy đơn hàng thành công');
                              // Refresh orders
                              const response = await orderService.getMyOrders({ 
                                status: selectedStatus === 'all' ? undefined : selectedStatus,
                                pageSize: 50 
                              });
                              setOrders(response.items || []);
                            } catch (err) {
                              alert('Không thể hủy đơn hàng: ' + (err as Error).message);
                            }
                          }
                        }}
                      >
                        Hủy đơn
                      </Button>
                    )}

                    {order.status.toLowerCase() === 'shipping' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                          <path d="M15 18H9" />
                          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                          <circle cx="17" cy="18" r="2" />
                          <circle cx="7" cy="18" r="2" />
                        </svg>
                        Theo dõi vận chuyển
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
