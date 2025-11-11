'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  lastUpdate: string;
  messages: {
    sender: 'user' | 'support';
    message: string;
    time: string;
  }[];
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-2024-001',
    subject: 'Vấn đề thanh toán đơn hàng',
    category: 'Thanh toán',
    status: 'resolved',
    priority: 'high',
    createdDate: '2024-11-05T10:00:00',
    lastUpdate: '2024-11-06T14:30:00',
    messages: [
      {
        sender: 'user',
        message: 'Tôi không thể thanh toán đơn hàng ORD-2024-001',
        time: '2024-11-05T10:00:00',
      },
      {
        sender: 'support',
        message:
          'Chúng tôi đã kiểm tra và khắc phục vấn đề. Bạn vui lòng thử lại nhé!',
        time: '2024-11-06T14:30:00',
      },
    ],
  },
  {
    id: 'TKT-2024-002',
    subject: 'Hỏi về chính sách đổi trả',
    category: 'Chính sách',
    status: 'in-progress',
    priority: 'medium',
    createdDate: '2024-11-07T09:15:00',
    lastUpdate: '2024-11-07T15:20:00',
    messages: [
      {
        sender: 'user',
        message: 'Tôi muốn biết chính sách đổi trả sách như thế nào?',
        time: '2024-11-07T09:15:00',
      },
      {
        sender: 'support',
        message:
          'Chúng tôi đang xem xét yêu cầu của bạn và sẽ phản hồi sớm nhất.',
        time: '2024-11-07T15:20:00',
      },
    ],
  },
];

const statusConfig: Record<
  Ticket['status'],
  { label: string; color: string; icon: JSX.Element }
> = {
  open: {
    label: 'Mở',
    color: 'bg-blue-100 text-blue-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15V5a2 2 0 0 0-2-2H7" />
        <path d="M3 7v10a2 2 0 0 0 2 2h12" />
        <path d="m3 7 4-4" />
        <path d="M7 3v4" />
      </svg>
    ),
  },
  'in-progress': {
    label: 'Đang xử lý',
    color: 'bg-yellow-100 text-yellow-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l3 3" />
      </svg>
    ),
  },
  resolved: {
    label: 'Đã giải quyết',
    color: 'bg-green-100 text-green-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
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
  closed: {
    label: 'Đã đóng',
    color: 'bg-gray-100 text-gray-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
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

const priorityConfig = {
  low: { label: 'Thấp', color: 'text-gray-600' },
  medium: { label: 'Trung bình', color: 'text-yellow-600' },
  high: { label: 'Cao', color: 'text-red-600' },
};

const categories = [
  'Thanh toán',
  'Đơn hàng',
  'Sản phẩm',
  'Chính sách',
  'Tài khoản',
  'Khác',
];

export default function CustomerSupportPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hỗ trợ khách hàng
            </h1>
            <p className="text-gray-600 mt-1">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Tạo yêu cầu mới
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092A10 10 0 1 0 2.992 16.342Z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Câu hỏi thường gặp
              </h3>
              <p className="text-sm text-gray-600">Tìm câu trả lời nhanh</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5h16" />
                  <path d="M4 9h16" />
                  <path d="M4 13h10" />
                  <path d="m15 17 2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Chat trực tuyến
              </h3>
              <p className="text-sm text-gray-600">
                Hỗ trợ trực tiếp qua chat
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.7 12.7 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 11.08a16 16 0 0 0 6 6l2.44-1.26a2 2 0 0 1 2.11.2 12.6 12.6 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hotline</h3>
              <p className="text-sm text-gray-600">1900 xxxx (8h - 22h)</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="mt-2">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092A10 10 0 1 0 2.992 16.342Z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              Yêu cầu hỗ trợ của tôi
            </CardTitle>
            <CardDescription>
              Xem trạng thái các yêu cầu bạn đã gửi
            </CardDescription>
          </CardHeader>

          {mockTickets.length === 0 ? (
            <CardContent className="p-12 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3C7.03 3 3 6.58 3 11c0 1.426.39 2.766 1.07 3.95L3 21l4.37-1.805C8.31 19.72 10.08 20 12 20c4.97 0 9-3.58 9-8s-4.03-8-9-8Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Chưa có yêu cầu nào
                </h3>
                <p className="text-gray-500 mt-1">
                  Tạo yêu cầu hỗ trợ khi bạn cần giúp đỡ
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                Tạo yêu cầu mới
              </Button>
            </CardContent>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {ticket.subject}
                        </h3>
                        <Badge
                          className={`flex items-center gap-1 ${statusConfig[ticket.status].color}`}
                        >
                          {statusConfig[ticket.status].icon}
                          {statusConfig[ticket.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m4 7 8-4 8 4" />
                            <path d="M12 3v18" />
                            <path d="m4 19 8 2 8-2" />
                          </svg>
                          {ticket.category}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${priorityConfig[ticket.priority].color}`}
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
                            <path d="m3 8 4-4 4 4" />
                            <path d="M7 4v16" />
                            <path d="M11 12h10" />
                            <path d="M11 16h7" />
                            <path d="M11 20h4" />
                          </svg>
                          {priorityConfig[ticket.priority].label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ticket.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Cập nhật:{' '}
                        {new Date(ticket.lastUpdate).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Create Ticket Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader className="sticky top-0 bg-white z-10 border-b border-gray-200 flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Tạo yêu cầu hỗ trợ</CardTitle>
                  <CardDescription>
                    Điền thông tin bên dưới để chúng tôi hỗ trợ bạn tốt hơn
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateForm(false)}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 6 12 12" />
                    <path d="m6 18 12-12" />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tiêu đề *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả ngắn gọn vấn đề của bạn"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Danh mục *
                  </label>
                  <select
                    id="category"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Độ ưu tiên *
                  </label>
                  <select
                    id="priority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nội dung chi tiết *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đính kèm file (nếu có)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                    <svg
                      className="w-8 h-8 text-gray-400 mx-auto mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 0 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3-3 3" />
                      <path d="M12 22V10" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Click để chọn file hoặc kéo thả vào đây
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, PDF (tối đa 5MB)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Hủy
                  </Button>
                  <Button className="flex-1">Gửi yêu cầu</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader className="sticky top-0 bg-white z-10 border-b border-gray-200 flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  <CardDescription>{selectedTicket.id}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTicket(null)}
                >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 6 12 12" />
                      <path d="m6 18 12-12" />
                    </svg>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {/* Messages */}
                <div className="space-y-4 mb-6">
                  {selectedTicket.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.sender === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.time).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="border-t border-gray-200 pt-4">
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tin nhắn..."
                  />
                  <div className="flex gap-2 mt-2">
                    <Button className="flex-1">Gửi tin nhắn</Button>
                    {selectedTicket.status !== 'closed' && (
                      <Button variant="outline">Đóng yêu cầu</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
