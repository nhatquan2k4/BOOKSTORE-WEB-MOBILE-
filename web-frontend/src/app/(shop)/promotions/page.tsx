"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

// ============================================================================
// TYPES
// ============================================================================
type PromotionType = "flashsale" | "voucher" | "combo" | "seasonal";

type Promotion = {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  discount: number;
  startDate: string;
  endDate: string;
  image: string;
  status: "active" | "upcoming" | "expired";
  terms?: string[];
};

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  discount: number;
  cover: string;
  rating: number;
  soldCount: number;
};

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "1",
    title: "Flash Sale Cuối Tuần",
    description: "Giảm giá sốc lên đến 50% cho hàng trăm đầu sách hot",
    type: "flashsale",
    discount: 50,
    startDate: "2024-11-08T00:00:00",
    endDate: "2024-11-10T23:59:59",
    image: "/image/anh.png",
    status: "active",
    terms: [
      "Áp dụng cho các sách được đánh dấu Flash Sale",
      "Số lượng có hạn, áp dụng theo thứ tự đặt hàng",
      "Không áp dụng đồng thời với voucher giảm giá khác",
    ],
  },
  {
    id: "2",
    title: "Mã Giảm 100K",
    description: "Nhập mã BOOK100 cho đơn hàng từ 500K",
    type: "voucher",
    discount: 100000,
    startDate: "2024-11-01T00:00:00",
    endDate: "2024-11-30T23:59:59",
    image: "/image/anh.png",
    status: "active",
    terms: [
      "Áp dụng cho đơn hàng từ 500.000đ",
      "Mỗi tài khoản chỉ sử dụng 1 lần",
      "Không áp dụng cho sách giáo khoa",
    ],
  },
  {
    id: "3",
    title: "Combo Sách Văn Học",
    description: "Mua 3 tặng 1 - Combo sách văn học Việt Nam",
    type: "combo",
    discount: 25,
    startDate: "2024-11-01T00:00:00",
    endDate: "2024-11-15T23:59:59",
    image: "/image/anh.png",
    status: "active",
    terms: [
      "Mua 3 cuốn sách văn học bất kỳ, tặng 1 cuốn có giá trị thấp nhất",
      "Áp dụng cho danh mục Văn học Việt Nam",
      "Tự động áp dụng khi thêm đủ số lượng vào giỏ hàng",
    ],
  },
  {
    id: "4",
    title: "Tháng Sách Học Thuật",
    description: "Giảm 30% toàn bộ sách học thuật và giáo trình",
    type: "seasonal",
    discount: 30,
    startDate: "2024-11-01T00:00:00",
    endDate: "2024-11-30T23:59:59",
    image: "/image/anh.png",
    status: "active",
    terms: [
      "Áp dụng cho tất cả sách học thuật và giáo trình",
      "Không giới hạn số lượng",
      "Có thể kết hợp với voucher vận chuyển",
    ],
  },
  {
    id: "5",
    title: "Black Friday 2024",
    description: "Sale khủng lên đến 70% - Sự kiện lớn nhất năm",
    type: "flashsale",
    discount: 70,
    startDate: "2024-11-29T00:00:00",
    endDate: "2024-11-29T23:59:59",
    image: "/image/anh.png",
    status: "upcoming",
    terms: [
      "Áp dụng cho toàn bộ sản phẩm",
      "Flash deal mỗi 2 giờ với giảm giá đặc biệt",
      "Miễn phí vận chuyển cho đơn từ 200.000đ",
    ],
  },
];

const FLASH_SALE_BOOKS: Book[] = [
  {
    id: "1",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: 47500,
    originalPrice: 95000,
    discount: 50,
    cover: "/image/anh.png",
    rating: 4.8,
    soldCount: 15432,
  },
  {
    id: "2",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    price: 140000,
    originalPrice: 280000,
    discount: 50,
    cover: "/image/anh.png",
    rating: 4.9,
    soldCount: 8976,
  },
  {
    id: "3",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    price: 42500,
    originalPrice: 85000,
    discount: 50,
    cover: "/image/anh.png",
    rating: 4.7,
    soldCount: 12543,
  },
  {
    id: "4",
    title: "Atomic Habits",
    author: "James Clear",
    price: 97500,
    originalPrice: 195000,
    discount: 50,
    cover: "/image/anh.png",
    rating: 4.9,
    soldCount: 9821,
  },
  {
    id: "5",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    price: 122500,
    originalPrice: 245000,
    discount: 50,
    cover: "/image/anh.png",
    rating: 4.6,
    soldCount: 6543,
  },
  {
    id: "6",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    price: 62500,
    originalPrice: 125000,
    discount: 50,
    cover: "/image/anh.png",
    rating: 4.8,
    soldCount: 7890,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PromotionsPage() {
  const [selectedType, setSelectedType] = useState<PromotionType | "all">("all");

  // Filter promotions
  const filteredPromotions =
    selectedType === "all"
      ? MOCK_PROMOTIONS
      : MOCK_PROMOTIONS.filter((p) => p.type === selectedType);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate time remaining
  const getTimeRemaining = (endDate: string) => {
    const now = Date.now();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Còn ${days} ngày`;
    if (hours > 0) return `Còn ${hours} giờ ${minutes} phút`;
    return `Còn ${minutes} phút`;
  };

  // Get promotion type badge
  const getTypeBadge = (type: PromotionType) => {
    const badges = {
      flashsale: { label: "Flash Sale", variant: "danger" as const },
      voucher: { label: "Mã Giảm Giá", variant: "success" as const },
      combo: { label: "Combo", variant: "warning" as const },
      seasonal: { label: "Theo Mùa", variant: "info" as const },
    };
    return badges[type];
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: "Đang diễn ra", variant: "success" as const },
      upcoming: { label: "Sắp diễn ra", variant: "warning" as const },
      expired: { label: "Đã kết thúc", variant: "secondary" as const },
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Khuyến mãi</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Chương Trình Khuyến Mãi
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Cập nhật các chương trình khuyến mãi hot nhất, tiết kiệm tối đa khi
            mua sắm
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            variant={selectedType === "all" ? "primary" : "secondary"}
            onClick={() => setSelectedType("all")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Tất cả
          </Button>
          <Button
            variant={selectedType === "flashsale" ? "primary" : "secondary"}
            onClick={() => setSelectedType("flashsale")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Flash Sale
          </Button>
          <Button
            variant={selectedType === "voucher" ? "primary" : "secondary"}
            onClick={() => setSelectedType("voucher")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            Mã Giảm Giá
          </Button>
          <Button
            variant={selectedType === "combo" ? "primary" : "secondary"}
            onClick={() => setSelectedType("combo")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" x2="12" y1="22.08" y2="12" />
            </svg>
            Combo
          </Button>
          <Button
            variant={selectedType === "seasonal" ? "primary" : "secondary"}
            onClick={() => setSelectedType("seasonal")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Theo Mùa
          </Button>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredPromotions.map((promotion) => {
            const typeBadge = getTypeBadge(promotion.type);
            const statusBadge = getStatusBadge(promotion.status);

            return (
              <Card
                key={promotion.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={promotion.image}
                    alt={promotion.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={typeBadge.variant}>
                      {typeBadge.label}
                    </Badge>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  {promotion.status === "active" && (
                    <div className="absolute bottom-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getTimeRemaining(promotion.endDate)}
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {promotion.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{promotion.description}</p>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-xl">
                      {promotion.type === "voucher"
                        ? formatPrice(promotion.discount)
                        : `${promotion.discount}%`}
                    </div>
                    <div className="text-sm text-gray-500">
                      <div>
                        Từ:{" "}
                        {new Date(
                          promotion.startDate
                        ).toLocaleDateString("vi-VN")}
                      </div>
                      <div>
                        Đến:{" "}
                        {new Date(
                          promotion.endDate
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  {promotion.terms && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                        Điều kiện:
                      </h4>
                      <ul className="space-y-1">
                        {promotion.terms.map((term) => (
                          <li
                            key={term}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-600 flex-shrink-0 mt-0.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {term}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href="/books">
                    <Button className="w-full" variant="primary">
                      Mua Ngay
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Flash Sale Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <h2 className="text-3xl font-bold text-gray-900">
                Flash Sale Hôm Nay
              </h2>
            </div>
            <Link
              href="/books?filter=flashsale"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Xem tất cả
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FLASH_SALE_BOOKS.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100"
              >
                {/* Book Cover */}
                <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Giữ lại badge đã bán */}
                  <Badge className="absolute bottom-2 left-2 text-xs bg-black/70 text-white">
                    Đã bán: {book.soldCount.toLocaleString()}
                  </Badge>
                </div>

                {/* Book Info */}
                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">{book.author}</p>

                {/* Price (đưa % giảm xuống đây) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-red-600 font-bold text-sm">
                      {formatPrice(book.price)}
                    </p>
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(book.originalPrice)}
                    </p>
                    <span className="text-[11px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      -{book.discount}%
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-yellow-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-xs text-gray-600">{book.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <h3 className="text-2xl font-bold mb-2">Đăng Ký Nhận Khuyến Mãi</h3>
          <p className="mb-6 text-blue-100">
            Nhận thông báo về các chương trình khuyến mãi mới nhất qua email
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
