// Trending Books Page - Trang Sách Thịnh Hành
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

  // Calculate stats
  const totalViews = trendingBooks.reduce((sum, book) => sum + book.weeklyViews, 0);
  const totalOrders = trendingBooks.reduce((sum, book) => sum + book.weeklyOrders, 0);
  const avgRating = (trendingBooks.reduce((sum, book) => sum + book.rating, 0) / trendingBooks.length).toFixed(1);
  const hotBooksCount = trendingBooks.filter(b => b.isHot).length;

  const getTrendIcon = (change: string) => {
    switch (change) {
      case "up":
        return <span className="text-green-500 font-bold">↑</span>;
      case "down":
        return <span className="text-red-500 font-bold">↓</span>;
      case "new":
        return <span className="text-blue-500 font-bold">★</span>;
      case "stable":
        return <span className="text-gray-500 font-bold">→</span>;
      default:
        return null;
    }
  };

  const getPositionChange = (book: Book) => {
    if (!book.lastWeekPosition) return null;
    const change = book.lastWeekPosition - (book.position || 0);
    if (change > 0) {
      return (
        <span className="text-green-600 text-xs font-semibold">
          +{change}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="text-red-600 text-xs font-semibold">
          {change}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Sách Thịnh Hành</h1>
              <p className="text-rose-100 mt-1">Những cuốn sách đang được yêu thích nhất</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{trendingBooks.length}</div>
              <div className="text-rose-100 text-sm mt-1">Sách thịnh hành</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{(totalViews / 1000).toFixed(0)}K</div>
              <div className="text-rose-100 text-sm mt-1">Lượt xem/tuần</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{(totalOrders / 1000).toFixed(1)}K</div>
              <div className="text-rose-100 text-sm mt-1">Đơn hàng/tuần</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{avgRating}⭐</div>
              <div className="text-rose-100 text-sm mt-1">Đánh giá TB</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                Khung thời gian:
              </span>
              {(["today", "week", "month"] as TimeFilter[]).map((filter) => (
                <Button
                  key={filter}
                  variant={timeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(filter)}
                  className="text-xs"
                >
                  {filter === "today" && "Hôm nay"}
                  {filter === "week" && "Tuần này"}
                  {filter === "month" && "Tháng này"}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {displayedBooks.map((book, index) => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                {/* Ranking Badge */}
                {book.position && book.position <= 10 && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      book.position === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                      book.position === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                      book.position === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                      "bg-gradient-to-br from-rose-500 to-pink-600"
                    }`}>
                      {book.position}
                    </div>
                  </div>
                )}

                {/* Hot Badge */}
                {book.isHot && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold animate-pulse">
                      🔥 HOT
                    </Badge>
                  </div>
                )}

                {/* Book Cover */}
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Book Info */}
                <div className="p-4">
                  {/* Trend Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-rose-200 text-rose-700">
                      {getTrendIcon(book.trendChange)}
                      {book.trendChange === "new" ? "MỚI" : `${book.trendScore}%`}
                    </Badge>
                    {getPositionChange(book) && (
                      <div className="flex items-center gap-1 text-xs">
                        {getPositionChange(book)}
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{book.author}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{(book.weeklyViews / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📦</span>
                      <span>{(book.weeklyOrders / 1000).toFixed(1)}K</span>
                    </div>
                  </div>

                  {/* Category */}
                  <Badge variant="secondary" className="text-xs mb-3">
                    {book.category}
                  </Badge>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-medium ml-1">{book.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">({book.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <div className="text-rose-600 font-bold text-lg">
                      {book.price.toLocaleString()}₫
                    </div>
                    {book.originalPrice > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs line-through">
                          {book.originalPrice.toLocaleString()}₫
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
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
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "bg-rose-600 hover:bg-rose-700" : ""}
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
              Sau →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
