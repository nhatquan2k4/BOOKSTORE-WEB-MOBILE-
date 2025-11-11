// New Releases Page - Trang Sách Mới Ra Mắt
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface NewBook {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  cover: string;
  rating: number;
  reviews: number;
  releaseDate: string; // Format: YYYY-MM-DD
  category: string;
  publisher: string;
  pageCount: number;
  language: string;
  isPreorder: boolean;
  isExclusive: boolean; // Độc quyền
  stockStatus: "in-stock" | "low-stock" | "pre-order" | "coming-soon";
  description: string;
}

const newReleases: NewBook[] = [
  {
    id: 1,
    title: "AI for Everyone",
    author: "Andrew Ng",
    price: 285000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 234,
    releaseDate: "2024-11-01",
    category: "Công nghệ",
    publisher: "Tech Publishing",
    pageCount: 420,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: true,
    stockStatus: "in-stock",
    description: "Hướng dẫn toàn diện về AI cho mọi người, không cần kiến thức lập trình",
  },
  {
    id: 2,
    title: "The Future of Work",
    author: "Darrell West",
    price: 245000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 156,
    releaseDate: "2024-10-28",
    category: "Kinh doanh",
    publisher: "Business Books",
    pageCount: 356,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Tương lai của công việc trong thời đại AI và automation",
  },
  {
    id: 3,
    title: "Quantum Computing Basics",
    author: "Michael Chen",
    price: 395000,
    originalPrice: 480000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 89,
    releaseDate: "2024-10-25",
    category: "Khoa học",
    publisher: "Science Press",
    pageCount: 512,
    language: "Tiếng Anh",
    isPreorder: false,
    isExclusive: true,
    stockStatus: "low-stock",
    description: "Giới thiệu cơ bản về điện toán lượng tử cho người mới bắt đầu",
  },
  {
    id: 4,
    title: "Design Thinking 2025",
    author: "Sarah Johnson",
    price: 198000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 312,
    releaseDate: "2024-10-20",
    category: "Thiết kế",
    publisher: "Creative House",
    pageCount: 298,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Phương pháp Design Thinking hiện đại nhất cho năm 2025",
  },
  {
    id: 5,
    title: "Sustainable Living Guide",
    author: "Emma Green",
    price: 165000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.5,
    reviews: 267,
    releaseDate: "2024-10-15",
    category: "Kỹ năng sống",
    publisher: "Eco Books",
    pageCount: 234,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Hướng dẫn sống xanh và bền vững trong thời đại hiện đại",
  },
  {
    id: 6,
    title: "Modern JavaScript Mastery",
    author: "Kyle Simpson",
    price: 358000,
    originalPrice: 420000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 445,
    releaseDate: "2024-10-12",
    category: "Lập trình",
    publisher: "Code Masters",
    pageCount: 678,
    language: "Tiếng Anh",
    isPreorder: false,
    isExclusive: true,
    stockStatus: "in-stock",
    description: "Làm chủ JavaScript hiện đại với ES2024 và các framework mới nhất",
  },
  {
    id: 7,
    title: "The Art of Negotiation",
    author: "Chris Voss",
    price: 215000,
    originalPrice: 280000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 523,
    releaseDate: "2024-10-08",
    category: "Kinh doanh",
    publisher: "Business Plus",
    pageCount: 345,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Nghệ thuật đàm phán từ cựu đặc vụ FBI",
  },
  {
    id: 8,
    title: "Climate Change Action",
    author: "Dr. Jane Smith",
    price: 185000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 178,
    releaseDate: "2024-10-05",
    category: "Khoa học",
    publisher: "Environmental Press",
    pageCount: 289,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Hành động chống biến đổi khí hậu: Những giải pháp thực tế",
  },
  {
    id: 9,
    title: "Digital Marketing 2025",
    author: "Neil Patel",
    price: 275000,
    originalPrice: 340000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 687,
    releaseDate: "2024-11-05",
    category: "Marketing",
    publisher: "Marketing Pro",
    pageCount: 456,
    language: "Tiếng Việt",
    isPreorder: true,
    isExclusive: true,
    stockStatus: "pre-order",
    description: "Chiến lược Digital Marketing cho năm 2025 và tương lai",
  },
  {
    id: 10,
    title: "The Mindful Leader",
    author: "Michael Carroll",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 234,
    releaseDate: "2024-10-01",
    category: "Kỹ năng sống",
    publisher: "Leadership Books",
    pageCount: 312,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Lãnh đạo với sự tỉnh thức và chánh niệm",
  },
  {
    id: 11,
    title: "React 19 Deep Dive",
    author: "Dan Abramov",
    price: 385000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 567,
    releaseDate: "2024-11-10",
    category: "Lập trình",
    publisher: "Web Dev Books",
    pageCount: 589,
    language: "Tiếng Anh",
    isPreorder: true,
    isExclusive: true,
    stockStatus: "pre-order",
    description: "Khám phá sâu React 19 với Server Components và các tính năng mới",
  },
  {
    id: 12,
    title: "The Innovation Mindset",
    author: "Lorraine Marchand",
    price: 225000,
    originalPrice: 290000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 345,
    releaseDate: "2024-09-28",
    category: "Kinh doanh",
    publisher: "Innovation Press",
    pageCount: 367,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Phát triển tư duy đổi mới sáng tạo trong tổ chức",
  },
  {
    id: 13,
    title: "Vegan Cooking Masterclass",
    author: "Chef Maria Lee",
    price: 178000,
    originalPrice: 220000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 892,
    releaseDate: "2024-09-25",
    category: "Ẩm thực",
    publisher: "Food & Life",
    pageCount: 245,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Làm chủ nghệ thuật nấu ăn chay thuần với 200+ công thức",
  },
  {
    id: 14,
    title: "Blockchain Revolution",
    author: "Don Tapscott",
    price: 325000,
    originalPrice: 400000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 234,
    releaseDate: "2024-11-15",
    category: "Công nghệ",
    publisher: "Tech Future",
    pageCount: 478,
    language: "Tiếng Việt",
    isPreorder: true,
    isExclusive: true,
    stockStatus: "coming-soon",
    description: "Cách blockchain đang thay đổi tiền tệ, kinh doanh và thế giới",
  },
  {
    id: 15,
    title: "The Psychology of Happiness",
    author: "Dr. Martin Seligman",
    price: 205000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 456,
    releaseDate: "2024-09-20",
    category: "Tâm lý",
    publisher: "Mind Books",
    pageCount: 334,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Khoa học về hạnh phúc và cách áp dụng vào cuộc sống",
  },
  {
    id: 16,
    title: "Cloud Native Architecture",
    author: "Martin Fowler",
    price: 425000,
    originalPrice: 520000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 178,
    releaseDate: "2024-09-15",
    category: "Lập trình",
    publisher: "Cloud Press",
    pageCount: 612,
    language: "Tiếng Anh",
    isPreorder: false,
    isExclusive: true,
    stockStatus: "low-stock",
    description: "Thiết kế kiến trúc ứng dụng Cloud Native hiện đại",
  },
  {
    id: 17,
    title: "Financial Freedom",
    author: "Grant Sabatier",
    price: 235000,
    originalPrice: 300000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 678,
    releaseDate: "2024-09-10",
    category: "Tài chính",
    publisher: "Money Books",
    pageCount: 389,
    language: "Tiếng Việt",
    isPreorder: false,
    isExclusive: false,
    stockStatus: "in-stock",
    description: "Lộ trình đạt được tự do tài chính trong 5-10 năm",
  },
  {
    id: 18,
    title: "The Art of Game Design",
    author: "Jesse Schell",
    price: 365000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 345,
    releaseDate: "2024-09-05",
    category: "Thiết kế",
    publisher: "Game Dev Press",
    pageCount: 567,
    language: "Tiếng Anh",
    isPreorder: false,
    isExclusive: true,
    stockStatus: "in-stock",
    description: "Nghệ thuật thiết kế game từ lý thuyết đến thực hành",
  },
];

export default function NewReleasesPage() {
  const [sortBy, setSortBy] = useState<"releaseDate" | "rating" | "reviews">("releaseDate");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(newReleases.map((book) => book.category)))];

  // Filter books
  const filteredBooks = newReleases.filter((book) => {
    const categoryMatch = filterCategory === "all" || book.category === filterCategory;
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "pre-order" && book.isPreorder) ||
      (filterStatus === "in-stock" && book.stockStatus === "in-stock") ||
      (filterStatus === "exclusive" && book.isExclusive);
    return categoryMatch && statusMatch;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "releaseDate") return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const displayedBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Get days since release
  const getDaysSinceRelease = (dateString: string) => {
    const releaseDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - releaseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get stock badge
  const getStockBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-500 text-white text-xs">Còn hàng</Badge>;
      case "low-stock":
        return <Badge className="bg-orange-500 text-white text-xs">Sắp hết</Badge>;
      case "pre-order":
        return <Badge className="bg-blue-500 text-white text-xs">Đặt trước</Badge>;
      case "coming-soon":
        return <Badge className="bg-purple-500 text-white text-xs">Sắp ra mắt</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">✨</span>
              <h1 className="text-4xl md:text-5xl font-bold">Sách Mới Ra Mắt</h1>
            </div>
            <p className="text-lg text-emerald-100 mb-6">
              Khám phá những đầu sách mới nhất, cập nhật liên tục mỗi ngày từ các tác giả và nhà xuất bản hàng đầu
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{newReleases.length}</div>
                <div className="text-sm text-emerald-100">Sách mới</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">
                  {newReleases.filter((book) => book.isPreorder).length}
                </div>
                <div className="text-sm text-emerald-100">Đặt trước</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">
                  {newReleases.filter((book) => book.isExclusive).length}
                </div>
                <div className="text-sm text-emerald-100">Độc quyền</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">
                  {(
                    newReleases.reduce((sum, book) => sum + book.rating, 0) / newReleases.length
                  ).toFixed(1)}
                  ⭐
                </div>
                <div className="text-sm text-emerald-100">Đánh giá TB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterCategory === cat
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "Tất cả" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status & Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === "all"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("in-stock");
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === "in-stock"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Còn hàng
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("pre-order");
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === "pre-order"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Đặt trước
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("exclusive");
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === "exclusive"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Độc quyền
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="releaseDate">Mới nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="reviews">Nhiều review</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {displayedBooks.map((book) => {
            const daysSince = getDaysSinceRelease(book.releaseDate);
            const isNew = daysSince <= 7;
            const isComingSoon = daysSince < 0;

            return (
              <Link key={book.id} href={`/books/${book.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                  {/* New Badge */}
                  {isNew && !isComingSoon && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs">
                        ✨ MỚI
                      </Badge>
                    </div>
                  )}

                  {/* Exclusive Badge */}
                  {book.isExclusive && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                        👑 ĐỘC QUYỀN
                      </Badge>
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-12 right-2 z-10">{getStockBadge(book.stockStatus)}</div>

                  {/* Book Cover */}
                  <div className="relative h-64 bg-gray-100">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {isComingSoon && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-purple-600 text-white text-sm">Sắp ra mắt</Badge>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    {/* Category */}
                    <Badge variant="outline" className="text-xs mb-2">
                      {book.category}
                    </Badge>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {book.title}
                    </h3>

                    {/* Author */}
                    <p className="text-xs text-gray-600 mb-2">{book.author}</p>

                    {/* Publisher */}
                    <p className="text-xs text-gray-500 mb-2">NXB: {book.publisher}</p>

                    {/* Release Date */}
                    <div className="text-xs text-emerald-600 font-medium mb-2">
                      {isComingSoon ? `Ra mắt: ${formatDate(book.releaseDate)}` : `Ngày ra mắt: ${formatDate(book.releaseDate)}`}
                    </div>

                    {/* Days since release */}
                    {!isComingSoon && isNew && (
                      <div className="text-xs text-gray-600 mb-2">
                        {daysSince === 0 ? "Hôm nay" : `${daysSince} ngày trước`}
                      </div>
                    )}

                    {/* Rating & Reviews */}
                    {book.reviews > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-sm font-medium">{book.rating}</span>
                        <span className="text-xs text-gray-500">({book.reviews})</span>
                      </div>
                    )}

                    {/* Page Count & Language */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <span>📖 {book.pageCount} trang</span>
                      <span>•</span>
                      <span>{book.language}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">
                        {book.price.toLocaleString()}đ
                      </span>
                      {book.originalPrice > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {book.originalPrice.toLocaleString()}đ
                        </span>
                      )}
                    </div>

                    {/* Discount */}
                    {book.originalPrice > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs mt-2">
                        -{Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%
                      </Badge>
                    )}

                    {/* Pre-order Notice */}
                    {book.isPreorder && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        ⏰ Đặt trước ngay hôm nay!
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
