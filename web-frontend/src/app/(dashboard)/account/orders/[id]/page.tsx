"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";

type OrderType = "physical" | "digital";

interface BaseOrder {
  id: string;
  date: string;
  type: OrderType;
  items: {
    id: number;
    title: string;
    author: string;
    cover: string;
    price: number;
    quantity?: number;
  }[];
  subtotal: number;
  total: number;
  payment: {
    method: string;
    status: string;
  };
}

interface PhysicalOrder extends BaseOrder {
  type: "physical";
  status: "pending" | "processing" | "shipping" | "delivered" | "cancelled";
  shipping: number;
  discount: number;
  trackingNumber?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
  timeline: {
    status: string;
    time: string;
    description: string;
  }[];
}

interface DigitalOrder extends BaseOrder {
  type: "digital";
  status: "processing" | "completed" | "cancelled";
  downloadLink?: string;
  licenseKey?: string;
  expiryDate?: string;
  items: {
    id: number;
    title: string;
    author: string;
    cover: string;
    price: number;
    format: string[];
    fileSize: string;
  }[];
}

// Mock data
const mockPhysicalOrder: PhysicalOrder = {
  id: "PHY-2024-001",
  type: "physical",
  date: "2024-11-05T10:30:00",
  status: "delivered",
  items: [
    {
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      cover: "/image/anh.png",
      price: 350000,
      quantity: 1,
    },
    {
      id: 2,
      title: "Design Patterns",
      author: "Gang of Four",
      cover: "/image/anh.png",
      price: 200000,
      quantity: 1,
    },
  ],
  subtotal: 550000,
  shipping: 30000,
  discount: 50000,
  total: 530000,
  trackingNumber: "VN1234567890",
  payment: { method: "Thẻ tín dụng", status: "Đã thanh toán" },
  shippingAddress: {
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Nguyễn Văn Linh",
    ward: "Phường Tân Thuận Đông",
    district: "Quận 7",
    city: "TP. Hồ Chí Minh",
  },
  timeline: [
    {
      status: "Đặt hàng thành công",
      time: "05/11/2024 10:30",
      description: "Đơn hàng đã được tạo",
    },
    {
      status: "Đã xác nhận",
      time: "05/11/2024 11:00",
      description: "Người bán đã xác nhận đơn hàng",
    },
    {
      status: "Đang đóng gói",
      time: "05/11/2024 14:00",
      description: "Đơn hàng đang được đóng gói",
    },
    {
      status: "Đang giao",
      time: "06/11/2024 08:00",
      description: "Đơn vị vận chuyển đã nhận hàng",
    },
    {
      status: "Đã giao",
      time: "07/11/2024 15:30",
      description: "Giao hàng thành công",
    },
  ],
};

const mockDigitalOrder: DigitalOrder = {
  id: "DIG-2024-001",
  type: "digital",
  date: "2024-11-05T10:30:00",
  status: "completed",
  items: [
    {
      id: 1,
      title: "Clean Code (E-Book)",
      author: "Robert C. Martin",
      cover: "/image/anh.png",
      price: 199000,
      format: ["PDF", "EPUB", "MOBI"],
      fileSize: "12.5 MB",
    },
  ],
  subtotal: 199000,
  total: 199000,
  downloadLink: "https://example.com/download/abc123",
  licenseKey: "XXXX-YYYY-ZZZZ-AAAA",
  expiryDate: "2025-11-05",
  payment: { method: "Thẻ tín dụng", status: "Đã thanh toán" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  // Determine order type from ID prefix
  const isDigitalOrder = orderId.startsWith("DIG");
  const order = isDigitalOrder ? mockDigitalOrder : mockPhysicalOrder;

  const handleDownload = (format: string) => {
    alert(`Downloading ${format}...`);
  };

  const handleReadOnline = () => {
    router.push(`/reader/${orderId}`);
  };

  const renderTypeBadge = () => {
    if (order.type === "digital") {
      return (
        <Badge className="bg-white/20 text-white gap-1 backdrop-blur">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 7v14" />
            <path d="M16 12h2" />
            <path d="M16 8h2" />
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
            <path d="M6 12h2" />
            <path d="M6 8h2" />
          </svg>
          eBook
        </Badge>
      );
    }
    return (
      <Badge className="bg-white/20 text-white gap-1 backdrop-blur">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m7.5 4.27 4.5 2.6 4.5-2.6" />
          <path d="m3 6.5 4.5 2.6v5.2" />
          <path d="M21 6.5 16.5 9.1v5.2" />
          <path d="m3 6.5 4.5-2.6L12 6.5l4.5-2.6L21 6.5" />
        </svg>
        Sách giấy
      </Badge>
    );
  };

  const renderStatus = () => {
    const baseClass =
      "px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2";
    if (order.status === "delivered" || order.status === "completed") {
      return (
        <Button className="inline-flex items-center gap-2 bg-green-500 text-white hover:bg-green-600">
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
          Hoàn thành
        </Button>
      );
    }
    if (order.status === "shipping") {
      return (
        <div className={baseClass + " bg-yellow-400 text-gray-900"}>
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 17h6" />
            <path d="M5 17h1" />
            <path d="M3 9h13v8H3z" />
            <path d="M16 13h3l2 2v2h-5z" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          Đang giao
        </div>
      );
    }
    if (order.status === "processing" || order.status === "pending") {
      return (
        <div className={baseClass + " bg-white/20 text-white"}>
          <svg
            className="w-4 h-4"
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
          {order.status === "processing" ? "Đang xử lý" : "Chờ xác nhận"}
        </div>
      );
    }
    return (
      <div className={baseClass + " bg-red-500 text-white"}>
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
        Đã hủy
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/account/orders/${order.type}`)}
          className={`mb-6 flex items-center gap-2 ${
            order.type === "digital"
              ? "text-purple-600 hover:text-purple-700"
              : "text-blue-600 hover:text-blue-700"
          }`}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay lại danh sách đơn hàng
        </Button>

        {/* Header */}
        <div
          className={`rounded-lg p-6 mb-6 ${
            order.type === "digital"
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-gradient-to-r from-blue-600 to-cyan-600"
          } text-white`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{order.id}</h1>
                {renderTypeBadge()}
              </div>
              <p className="text-white/90">
                Ngày đặt: {new Date(order.date).toLocaleString("vi-VN")}
              </p>
            </div>
            {renderStatus()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 7v14" />
                    <path d="M16 12h2" />
                    <path d="M16 8h2" />
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                    <path d="M6 12h2" />
                    <path d="M6 8h2" />
                  </svg>
                  Sản phẩm đã đặt
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="relative w-20 h-28 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1 left-1">
                        <Badge className="bg-green-500 text-white text-xs">
                          eBook
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.author}
                      </p>
                      {order.type === "physical" && "quantity" in item && (
                        <p className="text-sm text-gray-500 mt-2">
                          Số lượng: x{item.quantity}
                        </p>
                      )}
                      {order.type === "digital" && "format" in item && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {item.format.map((f) => (
                            <Badge
                              key={f}
                              className="bg-purple-100 text-purple-700 rounded"
                            >
                              {f}
                            </Badge>
                          ))}
                          <Badge className="bg-gray-100 text-gray-700 gap-1">
                            <svg
                              className="w-3.5 h-3.5"
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
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Digital Order Actions */}
            {order.type === "digital" && order.status === "completed" && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
                      <path d="m8 12 4 4 4-4" />
                      <path d="M12 4v12" />
                    </svg>
                    Tải xuống và đọc
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleReadOnline}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
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
                        <path d="M12 7v14" />
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                        <path d="M6 12h2" />
                        <path d="M6 8h2" />
                      </svg>
                      Đọc ngay trên trình duyệt
                    </Button>
                    <div className="flex gap-2 flex-wrap">
                      {order.items[0] &&
                        "format" in order.items[0] &&
                        order.items[0].format.map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            onClick={() => handleDownload(format)}
                            className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-1"
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
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <path d="M7 10l5 5 5-5" />
                              <path d="M12 15V3" />
                            </svg>
                            {format}
                          </Button>
                        ))}
                    </div>
                  </div>
                  {order.licenseKey && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">
                        Mã kích hoạt:
                      </p>
                      <p className="font-mono text-purple-600 font-semibold">
                        {order.licenseKey}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Physical Order Timeline */}
            {order.type === "physical" && (
              <Card className="overflow-hidden border border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <svg
                      className="w-5 h-5 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v5h5" />
                      <path d="M21 21v-5h-5" />
                      <path d="M21 3h-5v5" />
                      <path d="M3 21h5v-5" />
                    </svg>
                    Trạng thái đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === order.timeline.length - 1
                                ? "bg-green-500"
                                : "bg-blue-500"
                            } text-white`}
                          >
                            {index === order.timeline.length - 1 ? (
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
                            ) : (
                              index + 1
                            )}
                          </div>
                          {index < order.timeline.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h3 className="font-medium text-gray-900">
                            {event.status}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address (Physical only) */}
            {order.type === "physical" && (
              <Card className="overflow-hidden border border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <svg
                      className="w-5 h-5 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z" />
                      <circle cx="12" cy="11" r="2" />
                    </svg>
                    Địa chỉ nhận hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.ward},{" "}
                      {order.shippingAddress.district},{" "}
                      {order.shippingAddress.city}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Mã vận đơn:</p>
                      <p className="font-mono text-blue-600 font-semibold">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="overflow-hidden border border-gray-200 sticky top-4">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 6h16" />
                    <path d="M4 10h16" />
                    <path d="M4 14h16" />
                    <path d="M4 18h16" />
                  </svg>
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium text-gray-900">
                    {order.subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {order.type === "physical" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium text-gray-900">
                        {order.shipping.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-green-600">
                        -{order.discount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </>
                )}
                {order.type === "digital" && order.expiryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hết hạn:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.expiryDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span
                      className={`font-bold text-xl ${
                        order.type === "digital"
                          ? "text-purple-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="overflow-hidden border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium text-gray-900">
                    {order.payment.method}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-green-600">
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
                    {order.payment.status}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {(order.status === "delivered" ||
                order.status === "completed") && (
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 gap-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 17.27 6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" />
                  </svg>
                  Đánh giá sản phẩm
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
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
                  <path d="m13.8 16.6 1-.4a2 2 0 0 1 2 .3l2 1.5a2 2 0 0 1 .3 3 3 3 0 0 1-2 1.1 19 19 0 0 1-8-3.4 19 19 0 0 1-5.9-6.1 3 3 0 0 1 .2-3L4.8 7a2 2 0 0 1 2-.3l2.2.9a2 2 0 0 1 1.1 2.6l-.4 1a2 2 0 0 0 .2 1.8 11 11 0 0 0 3.9 3.6z" />
                  <path d="m15.6 11.8 1.4-.4a2 2 0 0 0 1.2-1L19 8a2 2 0 0 0-.5-2.2l-1.4-1.3a2 2 0 0 0-2.2-.3l-1.6.8" />
                </svg>
                Liên hệ hỗ trợ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
