'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';

interface DigitalOrder {
  id: string;
  date: string;
  status: 'processing' | 'completed' | 'cancelled';
  total: number;
  downloadLink?: string;
  licenseKey?: string;
  expiryDate?: string;
  items: {
    id: number;
    title: string;
    cover: string;
    price: number;
    author: string;
    format: string[];
    fileSize: string;
    pages: number;
  }[];
}

const mockDigitalOrders: DigitalOrder[] = [
  {
    id: 'DIG-2024-001',
    date: '2024-11-05',
    status: 'completed',
    total: 199000,
    downloadLink: 'https://example.com/download/abc123',
    licenseKey: 'XXXX-XXXX-XXXX-XXXX',
    expiryDate: '2025-11-05',
    items: [
      {
        id: 1,
        title: 'Clean Code (E-Book)',
        cover: '/image/anh.png',
        price: 199000,
        author: 'Robert C. Martin',
        format: ['PDF', 'EPUB', 'MOBI'],
        fileSize: '12.5 MB',
        pages: 464,
      },
    ],
  },
  {
    id: 'DIG-2024-002',
    date: '2024-11-06',
    status: 'completed',
    total: 159000,
    downloadLink: 'https://example.com/download/def456',
    licenseKey: 'YYYY-YYYY-YYYY-YYYY',
    expiryDate: '2025-11-06',
    items: [
      {
        id: 2,
        title: 'The Pragmatic Programmer (E-Book)',
        cover: '/image/anh.png',
        price: 159000,
        author: 'Andrew Hunt',
        format: ['PDF', 'EPUB'],
        fileSize: '8.3 MB',
        pages: 352,
      },
    ],
  },
  {
    id: 'DIG-2024-003',
    date: '2024-11-07',
    status: 'processing',
    total: 299000,
    items: [
      {
        id: 3,
        title: 'Design Patterns (E-Book)',
        cover: '/image/anh.png',
        price: 299000,
        author: 'Gang of Four',
        format: ['PDF', 'EPUB', 'MOBI'],
        fileSize: '15.2 MB',
        pages: 416,
      },
    ],
  },
];

const statusConfig: Record<
  DigitalOrder['status'],
  { label: string; color: string; icon: JSX.Element }
> = {
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: (
      <svg
        className="w-4 h-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
  },
  completed: {
    label: 'Thành công',
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

export default function DigitalOrdersPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrders =
    selectedStatus === 'all'
      ? mockDigitalOrders
      : mockDigitalOrders.filter((order) => order.status === selectedStatus);

  const handleDownload = (orderId: string, format: string) => {
    alert(`Downloading ${format} for order ${orderId}...`);
  };

  const handleReadOnline = (orderId: string) => {
    router.push(`/reader/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/account/orders')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
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
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng E-Book</h1>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden border">
              <CardHeader className="bg-purple-50 border-b border-gray-200 flex justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {order.id}
                    <Badge
                      className={`flex items-center gap-1 border ${statusConfig[order.status].color}`}
                    >
                      {statusConfig[order.status].icon}
                      {statusConfig[order.status].label}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Mua ngày: {new Date(order.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
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
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-start p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    {/* Cover */}
                    <div className="relative w-20 h-28 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1 left-1">
                        <Badge className="bg-green-500 text-white text-xs">
                          {/* <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-book-open"
                          >
                            <path d="M12 7v14" />
                            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                          </svg> */}
                          eBook
                        </Badge>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-lg line-clamp-1 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{item.author}</p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                          </svg>
                          {item.pages} trang
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                            <path d="M3 12A9 3 0 0 0 21 12" />
                          </svg>
                          {item.fileSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="4" width="18" height="14" rx="2" />
                            <path d="M7 8h10" />
                            <path d="M7 12h4" />
                          </svg>
                          {item.format.map((f) => (
                            <span
                              key={f}
                              className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                            >
                              {f}
                            </span>
                          ))}
                        </span>
                      </div>

                      {/* Actions */}
                      {order.status === 'completed' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => handleReadOnline(order.id)}
                            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
                            size="sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 7v14" />
                              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                            </svg>
                            Đọc ngay
                          </Button>
                          {item.format.map((format) => (
                            <Button
                              key={format}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(order.id, format)}
                              className="flex items-center gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
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
                                <path d="M4 20h16" />
                                <path d="m9 12 3 3 3-3" />
                                <path d="M12 3v12" />
                              </svg>
                              Tải {format}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-purple-600 text-xl">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
