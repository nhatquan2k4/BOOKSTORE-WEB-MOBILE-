"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  originalPrice?: number;
  cover: string;
  rating: number;
  reviewCount: number;
  readCount: number;
  stock: number;
  trend: "up" | "down" | "stable";
};

type SortOption = "read-count" | "rating" | "price-asc" | "price-desc" | "trending";
type TimeRange = "week" | "month" | "year" | "all-time";

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5678,
    readCount: 125000,
    stock: 230,
    trend: "up",
  },
  {
    id: "2",
    title: "Atomic Habits - Thói Quen Nguyên Tử",
    author: "James Clear",
    category: "Kỹ năng sống",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    readCount: 98000,
    stock: 120,
    trend: "up",
  },
  {
    id: "3",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    readCount: 87000,
    stock: 180,
    trend: "stable",
  },
  {
    id: "4",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 280000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3421,
    readCount: 76000,
    stock: 90,
    trend: "up",
  },
  {
    id: "5",
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    readCount: 72000,
    stock: 150,
    trend: "stable",
  },
  {
    id: "6",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    category: "Tâm lý học",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    readCount: 65000,
    stock: 60,
    trend: "up",
  },
  {
    id: "7",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    category: "Kỹ năng sống",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    readCount: 58000,
    stock: 95,
    trend: "stable",
  },
  {
    id: "8",
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    category: "Kinh tế",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    readCount: 54000,
    stock: 45,
    trend: "down",
  },
  {
    id: "9",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    category: "Kinh doanh",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    readCount: 52000,
    stock: 110,
    trend: "stable",
  },
  {
    id: "10",
    title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    readCount: 48000,
    stock: 140,
    trend: "stable",
  },
  {
    id: "11",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Kỹ năng sống",
    price: 175000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    readCount: 45000,
    stock: 65,
    trend: "up",
  },
  {
    id: "12",
    title: "Càng Bình Tĩnh Càng Hạnh Phúc",
    author: "Megumi",
    category: "Tâm lý học",
    price: 98000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 2134,
    readCount: 43000,
    stock: 180,
    trend: "up",
  },
  {
    id: "13",
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    readCount: 41000,
    stock: 75,
    trend: "stable",
  },
  {
    id: "14",
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    author: "Keith Ferrazzi",
    category: "Kỹ năng sống",
    price: 155000,
    originalPrice: 195000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 876,
    readCount: 38000,
    stock: 70,
    trend: "stable",
  },
  {
    id: "15",
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    category: "Văn học",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    readCount: 36000,
    stock: 120,
    trend: "stable",
  },
  {
    id: "16",
    title: "The Lean Startup",
    author: "Eric Ries",
    category: "Kinh doanh",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 876,
    readCount: 34000,
    stock: 55,
    trend: "up",
  },
  {
    id: "17",
    title: "Psychology of Money",
    author: "Morgan Housel",
    category: "Kinh tế",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    readCount: 32000,
    stock: 90,
    trend: "up",
  },
  {
    id: "18",
    title: "Số Đỏ",
    author: "Vũ Trọng Phụng",
    category: "Văn học",
    price: 115000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    readCount: 30000,
    stock: 95,
    trend: "down",
  },
];

export default function MostReadBooksPage() {
  const [sortBy, setSortBy] = useState<SortOption>("read-count");
  const [timeRange, setTimeRange] = useState<TimeRange>("all-time");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const sortedBooks = [...MOCK_BOOKS].sort((a, b) => {
    switch (sortBy) {
      case "read-count":
        return b.readCount - a.readCount;
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "trending":
        if (a.trend === "up" && b.trend !== "up") return -1;
        if (a.trend !== "up" && b.trend === "up") return 1;
        return b.readCount - a.readCount;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatReadCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const calculateDiscount = (original: number, current: number) =>
    Math.round(((original - current) / original) * 100);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalReadCount = MOCK_BOOKS.reduce((acc, book) => acc + book.readCount, 0);

  const EyeIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const getTrendBadge = (trend: "up" | "down" | "stable") => {
    if (trend === "up") {
      return (
        <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold gap-1">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4 14 6-6 4 4 5-5" />
          </svg>
          HOT
        </Badge>
      );
    }
    if (trend === "down") {
      return (
        <Badge className="text-xs bg-red-500 text-white font-bold gap-1">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m20 7-6 6-4-4-5 5" />
          </svg>
          Giảm
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-slate-200 text-slate-700 font-semibold gap-1">
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12h16" />
        </svg>
        Ổn định
      </Badge>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Card className="bg-white/70 backdrop-blur">
            <CardContent className="py-3 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                Trang chủ
              </Link>{" "}
              / <span className="font-medium text-gray-800">Sách được đọc nhiều nhất</span>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <Card className="mb-6 bg-white/70 backdrop-blur">
          <CardContent className="flex items-start gap-3 py-6">
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
              className="text-blue-600"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Sách Được Đọc Nhiều Nhất
              </h1>
              <p className="text-gray-700 text-base md:text-lg font-medium flex items-center gap-2">
                <EyeIcon />
                {formatReadCount(totalReadCount)}+ lượt đọc - Những cuốn sách được yêu thích nhất
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="time-range" className="text-sm font-semibold text-gray-700 mb-2 block">
                Khoảng thời gian:
              </label>
              <select
                id="time-range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
                <option value="all-time">Tất cả</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-read" className="text-sm font-semibold text-gray-700 mb-2 block">
                Sắp xếp theo:
              </label>
              <select
                id="sort-read"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="read-count">Lượt đọc nhiều nhất</option>
                <option value="trending">Đang thịnh hành</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full text-sm text-gray-600 p-2 bg-blue-50 rounded-lg text-center">
                Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
                <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> /{" "}
                <span className="font-semibold">{sortedBooks.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {paginatedBooks.map((book, index) => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <Card className="flex flex-col h-full rounded-xl bg-white shadow-sm transition hover:shadow-lg group">
                <CardContent className="p-3">
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {startIndex + index < 3 && (
                      <div className="absolute top-2 left-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-lg">
                        {startIndex + index + 1}
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {getTrendBadge(book.trend)}
                    </div>

                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <EyeIcon />
                      {formatReadCount(book.readCount)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                    <p className="text-xs text-blue-600 font-semibold">{book.category}</p>

                    <div className="flex items-center gap-1 pt-1">
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
                      <span className="text-xs font-bold text-gray-700">{book.rating}</span>
                      <span className="text-xs text-gray-500">({book.reviewCount})</span>
                    </div>

                    {/* Giá + giá gốc + % giảm */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <p className="text-blue-600 font-bold text-sm">{formatPrice(book.price)}</p>
                      {book.originalPrice && (
                        <>
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(book.originalPrice)}
                          </p>
                          <Badge variant="danger" className="text-xs font-bold">
                            -{calculateDiscount(book.originalPrice, book.price)}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </main>
  );
}
