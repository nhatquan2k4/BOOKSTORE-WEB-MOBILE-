"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  cover: string;
  rating: number;
  reviews: number;
  trendScore: number;
  trendChange: "up" | "down" | "new" | "stable";
  weeklyViews: number;
  weeklyOrders: number;
  category: string;
  isHot: boolean;
  position?: number;
  lastWeekPosition?: number;
}

const trendingBooks: Book[] = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    price: 189000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 15678,
    trendScore: 98,
    trendChange: "up",
    weeklyViews: 125000,
    weeklyOrders: 8500,
    category: "Kỹ năng sống",
    isHot: true,
    position: 1,
    lastWeekPosition: 3,
  },
  {
    id: 2,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    price: 165000,
    originalPrice: 220000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 12456,
    trendScore: 95,
    trendChange: "up",
    weeklyViews: 98000,
    weeklyOrders: 7200,
    category: "Kinh doanh",
    isHot: true,
    position: 2,
    lastWeekPosition: 5,
  },
  {
    id: 3,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 175000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 11234,
    trendScore: 94,
    trendChange: "new",
    weeklyViews: 89000,
    weeklyOrders: 6800,
    category: "Tài chính",
    isHot: true,
    position: 3,
  },
  {
    id: 4,
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 9876,
    trendScore: 92,
    trendChange: "stable",
    weeklyViews: 76000,
    weeklyOrders: 5400,
    category: "Lập trình",
    isHot: true,
    position: 4,
    lastWeekPosition: 4,
  },
  {
    id: 5,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 195000,
    originalPrice: 260000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 18900,
    trendScore: 91,
    trendChange: "down",
    weeklyViews: 72000,
    weeklyOrders: 5100,
    category: "Lịch sử",
    isHot: false,
    position: 5,
    lastWeekPosition: 2,
  },
  {
    id: 6,
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    price: 185000,
    originalPrice: 240000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 8765,
    trendScore: 89,
    trendChange: "up",
    weeklyViews: 68000,
    weeklyOrders: 4800,
    category: "Kỹ năng sống",
    isHot: false,
    position: 6,
    lastWeekPosition: 8,
  },
  {
    id: 7,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    price: 420000,
    originalPrice: 550000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 6543,
    trendScore: 88,
    trendChange: "new",
    weeklyViews: 54000,
    weeklyOrders: 4200,
    category: "Lập trình",
    isHot: false,
    position: 7,
  },
  {
    id: 8,
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 7654,
    trendScore: 86,
    trendChange: "up",
    weeklyViews: 51000,
    weeklyOrders: 3900,
    category: "Kinh doanh",
    isHot: false,
    position: 8,
    lastWeekPosition: 11,
  },
  {
    id: 9,
    title: "Deep Work",
    author: "Cal Newport",
    price: 175000,
    originalPrice: 225000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 6789,
    trendScore: 85,
    trendChange: "stable",
    weeklyViews: 49000,
    weeklyOrders: 3700,
    category: "Kỹ năng sống",
    isHot: false,
    position: 9,
    lastWeekPosition: 9,
  },
  {
    id: 10,
    title: "Zero to One",
    author: "Peter Thiel",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 7890,
    trendScore: 84,
    trendChange: "down",
    weeklyViews: 47000,
    weeklyOrders: 3500,
    category: "Kinh doanh",
    isHot: false,
    position: 10,
    lastWeekPosition: 7,
  },
  {
    id: 11,
    title: "The Design of Everyday Things",
    author: "Don Norman",
    price: 245000,
    originalPrice: 320000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 5432,
    trendScore: 82,
    trendChange: "up",
    weeklyViews: 43000,
    weeklyOrders: 3200,
    category: "Thiết kế",
    isHot: false,
    position: 11,
    lastWeekPosition: 14,
  },
  {
    id: 12,
    title: "Hooked",
    author: "Nir Eyal",
    price: 175000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 5678,
    trendScore: 81,
    trendChange: "new",
    weeklyViews: 41000,
    weeklyOrders: 3000,
    category: "Kinh doanh",
    isHot: false,
    position: 12,
  },
  {
    id: 13,
    title: "Educated",
    author: "Tara Westover",
    price: 155000,
    originalPrice: 200000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 9876,
    trendScore: 80,
    trendChange: "stable",
    weeklyViews: 39000,
    weeklyOrders: 2850,
    category: "Văn học",
    isHot: false,
    position: 13,
    lastWeekPosition: 13,
  },
  {
    id: 14,
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    price: 145000,
    originalPrice: 190000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviews: 8765,
    trendScore: 78,
    trendChange: "down",
    weeklyViews: 36000,
    weeklyOrders: 2650,
    category: "Kỹ năng sống",
    isHot: false,
    position: 14,
    lastWeekPosition: 10,
  },
  {
    id: 15,
    title: "Refactoring UI",
    author: "Adam Wathan & Steve Schoger",
    price: 380000,
    originalPrice: 480000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 4321,
    trendScore: 77,
    trendChange: "up",
    weeklyViews: 34000,
    weeklyOrders: 2500,
    category: "Thiết kế",
    isHot: false,
    position: 15,
    lastWeekPosition: 18,
  },
  {
    id: 16,
    title: "Start with Why",
    author: "Simon Sinek",
    price: 175000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 6543,
    trendScore: 76,
    trendChange: "stable",
    weeklyViews: 32000,
    weeklyOrders: 2350,
    category: "Kinh doanh",
    isHot: false,
    position: 16,
    lastWeekPosition: 16,
  },
  {
    id: 17,
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 23456,
    trendScore: 75,
    trendChange: "down",
    weeklyViews: 30000,
    weeklyOrders: 2200,
    category: "Kỹ năng sống",
    isHot: false,
    position: 17,
    lastWeekPosition: 12,
  },
  {
    id: 18,
    title: "The Phoenix Project",
    author: "Gene Kim",
    price: 295000,
    originalPrice: 380000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 5234,
    trendScore: 74,
    trendChange: "up",
    weeklyViews: 28000,
    weeklyOrders: 2050,
    category: "Lập trình",
    isHot: false,
    position: 18,
    lastWeekPosition: 21,
  },
];

type SortOption = "trend" | "views" | "orders" | "rating" | "price-asc" | "price-desc";
type TimeFilter = "today" | "week" | "month";

export default function TrendingBooksPage() {
  const [sortBy, setSortBy] = useState<SortOption>("trend");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 18;

  // Sort books
  const sortedBooks = [...trendingBooks].sort((a, b) => {
    switch (sortBy) {
      case "trend":
        return b.trendScore - a.trendScore;
      case "views":
        return b.weeklyViews - a.weeklyViews;
      case "orders":
        return b.weeklyOrders - a.weeklyOrders;
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const displayedBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);
  const endIndex = startIndex + booksPerPage;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate discount
  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách thịnh hành</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Sách Thịnh Hành
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {sortedBooks.length} đầu sách đang được yêu thích nhất
          </p>
        </div>
        {/* Filters & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, sortedBooks.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{sortedBooks.length}</span> sách
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="trend">Độ thịnh hành</option>
              <option value="views">Lượt xem</option>
              <option value="orders">Đơn hàng</option>
              <option value="rating">Đánh giá</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {displayedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
            >
              {/* Book Cover */}
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* HOT Badge */}
                {book.isHot && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                    🔥 HOT
                  </Badge>
                )}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 mb-1">{book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
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
                <span className="text-xs text-gray-400">
                  ({book.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-red-600 font-bold text-sm">
                  {formatPrice(book.price)}
                </p>
                {book.originalPrice && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(book.originalPrice)}
                    </p>
                    <Badge variant="danger" className="text-xs font-bold">
                      -{calculateDiscount(book.originalPrice, book.price)}%
                    </Badge>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Trước
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
