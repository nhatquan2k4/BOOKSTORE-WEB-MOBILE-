"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

// ============================================================================
// TYPES
// ============================================================================
type Book = {
  id: string;
  title: string;
  author: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  cover: string;
  rating: number;
  reviewCount: number;
  description: string;
  isBestseller: boolean;
};

type SubCategoryFilter = "all" | "habits" | "productivity" | "communication" | "mindset" | "leadership";

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_LIFESKILLS_BOOKS: Book[] = [
  {
    id: "1",
    title: "Atomic Habits - Thói Quen Nguyên Tử",
    author: "James Clear",
    subCategory: "habits",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    description: "Cách xây dựng thói quen tốt và loại bỏ thói quen xấu",
    isBestseller: true,
  },
  {
    id: "2",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    subCategory: "communication",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5678,
    description: "Nghệ thuật giao tiếp và ứng xử",
    isBestseller: true,
  },
  {
    id: "3",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    subCategory: "habits",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    description: "Thói quen của người thành đạt",
    isBestseller: true,
  },
  {
    id: "4",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    subCategory: "mindset",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    description: "Cách não bộ hoạt động và đưa ra quyết định",
    isBestseller: false,
  },
  {
    id: "5",
    title: "Sức Mạnh Của Thói Quen",
    author: "Charles Duhigg",
    subCategory: "habits",
    price: 165000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    description: "Khoa học đằng sau thói quen",
    isBestseller: false,
  },
  {
    id: "6",
    title: "Nghĩ Khác Để Thành Công",
    author: "David J. Schwartz",
    subCategory: "mindset",
    price: 145000,
    originalPrice: 185000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 987,
    description: "Suy nghĩ tích cực dẫn đến thành công",
    isBestseller: false,
  },
  {
    id: "7",
    title: "Làm Chủ Thời Gian",
    author: "Brian Tracy",
    subCategory: "productivity",
    price: 135000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    description: "Quản lý thời gian hiệu quả",
    isBestseller: false,
  },
  {
    id: "8",
    title: "The 5 AM Club",
    author: "Robin Sharma",
    subCategory: "productivity",
    price: 185000,
    originalPrice: 235000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1543,
    description: "Buổi sáng quyết định cuộc đời",
    isBestseller: false,
  },
  {
    id: "9",
    title: "Deep Work",
    author: "Cal Newport",
    subCategory: "productivity",
    price: 175000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    description: "Làm việc sâu trong thời đại phân tâm",
    isBestseller: false,
  },
  {
    id: "10",
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    author: "Keith Ferrazzi",
    subCategory: "communication",
    price: 155000,
    originalPrice: 195000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 876,
    description: "Xây dựng mạng lưới quan hệ",
    isBestseller: false,
  },
  {
    id: "11",
    title: "Nghệ Thuật Giao Tiếp",
    author: "Leil Lowndes",
    subCategory: "communication",
    price: 125000,
    cover: "/image/anh.png",
    rating: 4.4,
    reviewCount: 1234,
    description: "92 bí quyết giao tiếp thành công",
    isBestseller: false,
  },
  {
    id: "12",
    title: "Leaders Eat Last",
    author: "Simon Sinek",
    subCategory: "leadership",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1876,
    description: "Nghệ thuật lãnh đạo của người tiên phong",
    isBestseller: false,
  },
  {
    id: "13",
    title: "The Leadership Challenge",
    author: "James Kouzes",
    subCategory: "leadership",
    price: 215000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 987,
    description: "Thách thức lãnh đạo trong thời đại mới",
    isBestseller: false,
  },
  {
    id: "14",
    title: "Mindset",
    author: "Carol Dweck",
    subCategory: "mindset",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2345,
    description: "Tư duy phát triển vs tư duy cố định",
    isBestseller: false,
  },
  {
    id: "15",
    title: "Năng Lực Tập Trung",
    author: "Cal Newport",
    subCategory: "productivity",
    price: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1543,
    description: "Làm việc có tập trung trong thời đại số",
    isBestseller: false,
  },
  {
    id: "16",
    title: "Ăn Nói Như Một Nhà Lãnh Đạo",
    author: "Dianna Booher",
    subCategory: "leadership",
    price: 135000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 876,
    description: "Giao tiếp như một lãnh đạo xuất sắc",
    isBestseller: false,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LifeSkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SubCategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter books
  const filteredBooks =
    selectedCategory === "all"
      ? MOCK_LIFESKILLS_BOOKS
      : MOCK_LIFESKILLS_BOOKS.filter((book) => book.subCategory === selectedCategory);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

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

  // Handle category change
  const handleCategoryChange = (category: SubCategoryFilter) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Kỹ năng sống</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Kỹ Năng Sống</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {filteredBooks.length} cuốn sách giúp bạn phát triển bản thân
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
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
              className="inline-block mr-2"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            Tất cả ({MOCK_LIFESKILLS_BOOKS.length})
          </button>
          <button
            onClick={() => handleCategoryChange("habits")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === "habits"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Thói quen ({MOCK_LIFESKILLS_BOOKS.filter((b) => b.subCategory === "habits").length})
          </button>
          <button
            onClick={() => handleCategoryChange("productivity")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === "productivity"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Năng suất ({MOCK_LIFESKILLS_BOOKS.filter((b) => b.subCategory === "productivity").length})
          </button>
          <button
            onClick={() => handleCategoryChange("communication")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === "communication"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Giao tiếp ({MOCK_LIFESKILLS_BOOKS.filter((b) => b.subCategory === "communication").length})
          </button>
          <button
            onClick={() => handleCategoryChange("mindset")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === "mindset"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Tư duy ({MOCK_LIFESKILLS_BOOKS.filter((b) => b.subCategory === "mindset").length})
          </button>
          <button
            onClick={() => handleCategoryChange("leadership")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === "leadership"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Lãnh đạo ({MOCK_LIFESKILLS_BOOKS.filter((b) => b.subCategory === "leadership").length})
          </button>
        </div>

        {/* Result Count */}
        <div className="mb-6 text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
          <span className="font-semibold">{Math.min(endIndex, filteredBooks.length)}</span> trong tổng số{" "}
          <span className="font-semibold">{filteredBooks.length}</span> sách
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {paginatedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Book Cover */}
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Bestseller Badge */}
                {book.isBestseller && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="inline-block mr-1"
                    >
                      <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                    </svg>
                    BÁN CHẠY
                  </Badge>
                )}

                {/* Discount Badge */}
                {book.originalPrice && (
                  <Badge variant="danger" className="absolute top-2 left-2 text-xs">
                    -{calculateDiscount(book.originalPrice, book.price)}%
                  </Badge>
                )}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{book.author}</p>

              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                <p className="text-blue-600 font-bold text-sm">{formatPrice(book.price)}</p>
                {book.originalPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(book.originalPrice)}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
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
                <span className="text-xs text-gray-400">({book.reviewCount})</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
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
