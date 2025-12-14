'use client';

import { useState } from 'react';
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

  const filteredOrders =
    selectedStatus === 'all'
      ? mockPhysicalOrders
      : mockPhysicalOrders.filter((order) => order.status === selectedStatus);

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
                {mockPhysicalOrders.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Tổng đơn</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {
                  mockPhysicalOrders.filter((o) => o.status === 'pending')
                    .length
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">Chờ xác nhận</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {
                  mockPhysicalOrders.filter((o) => o.status === 'processing')
                    .length
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">Đang xử lý</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {
                  mockPhysicalOrders.filter((o) => o.status === 'shipping')
                    .length
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">Đang giao</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {
                  mockPhysicalOrders.filter((o) => o.status === 'delivered')
                    .length
                }
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
              Tất cả ({mockPhysicalOrders.length})
            </Button>
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = mockPhysicalOrders.filter(
                (o) => o.status === key
              ).length;
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
                      <CardTitle>{order.id}</CardTitle>
                      <Badge
                        variant="default"
                        className={`flex items-center gap-1 border ${statusConfig[order.status].color}`}
                      >
                        {statusConfig[order.status].icon}
                        {statusConfig[order.status].label}
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
                          {new Date(order.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                 
                      {order.estimatedDelivery && (
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
                            <path d="M14 19V7a2 2 0 0 0-2-2H9" />
                            <path d="M15 19H9" />
                            <path d="M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" />
                            <path d="M2 13v5a1 1 0 0 0 1 1h2" />
                            <path d="M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02" />
                            <circle cx="17" cy="19" r="2" />
                            <circle cx="7" cy="19" r="2" />
                          </svg>
                          <span>
                            Dự kiến:{' '}
                            {new Date(
                              order.estimatedDelivery
                            ).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}

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
                          {order.shippingAddress}
                        </span>
                      </div>

                      {order.trackingNumber && (
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
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                          <span className="font-mono">
                            {order.trackingNumber}
                          </span>
                        </div>
                      )}
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
                          src={item.cover}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.author}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Số lượng: x{item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer actions giống eBook kiểu tách theo trạng thái */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">
                      Tổng thanh toán:
                    </span>
                    <span className="font-bold text-blue-600 text-xl">
                      {order.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {order.status === 'delivered' && (
                      <>
                        <Button variant="outline" size="sm">
                          Mua lại
                        </Button>
                        <Button variant="ghost" size="sm">
                          Đánh giá
                        </Button>
                      </>
                    )}

                    {(order.status === 'pending' ||
                      order.status === 'processing') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Hủy đơn
                      </Button>
                    )}

                    {order.status === 'shipping' && (
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
