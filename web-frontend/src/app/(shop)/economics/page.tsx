"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  isRecommended: boolean;
};

type SubCategoryFilter =
  | "all"
  | "macro"
  | "micro"
  | "finance"
  | "investing"
  | "business";

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_ECONOMICS_BOOKS: Book[] = [
  {
    id: "1",
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    subCategory: "finance",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    description: "Lịch sử và tương lai của hệ thống tài chính thế giới",
    isRecommended: true,
  },
  {
    id: "2",
    title: "Kinh Tế Học Vĩ Mô",
    author: "N. Gregory Mankiw",
    subCategory: "macro",
    price: 285000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    description: "Nguyên lý kinh tế học vĩ mô cơ bản",
    isRecommended: true,
  },
  {
    id: "3",
    title: "Nhà Đầu Tư Thông Minh",
    author: "Benjamin Graham",
    subCategory: "investing",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    description: "Kinh thánh của đầu tư giá trị",
    isRecommended: true,
  },
  {
    id: "4",
    title: "Kinh Tế Học Vi Mô",
    author: "N. Gregory Mankiw",
    subCategory: "micro",
    price: 275000,
    originalPrice: 340000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1987,
    description: "Nguyên lý kinh tế học vi mô cơ bản",
    isRecommended: false,
  },
  {
    id: "5",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    subCategory: "business",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    description: "13 nguyên tắc nghĩ giàu làm giàu",
    isRecommended: false,
  },
  {
    id: "6",
    title: "Phân Tích Chứng Khoán",
    author: "Benjamin Graham",
    subCategory: "investing",
    price: 385000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1543,
    description: "Phân tích cơ bản và định giá cổ phiếu",
    isRecommended: false,
  },
  {
    id: "7",
    title: "Nghệ Thuật Bán Hàng Vĩ Đại",
    author: "Brian Tracy",
    subCategory: "business",
    price: 168000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 876,
    description: "Chiến lược bán hàng hiệu quả",
    isRecommended: false,
  },
  {
    id: "8",
    title: "Tài Chính Doanh Nghiệp",
    author: "Stephen Ross",
    subCategory: "finance",
    price: 345000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1234,
    description: "Nguyên lý tài chính doanh nghiệp hiện đại",
    isRecommended: false,
  },
  {
    id: "9",
    title: "Bố Già Của Phố Wall",
    author: "Benjamin Graham",
    subCategory: "investing",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    description: "Triết lý đầu tư của Warren Buffett",
    isRecommended: false,
  },
  {
    id: "10",
    title: "Kinh Tế Học Hành Vi",
    author: "Dan Ariely",
    subCategory: "micro",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    description: "Tại sao con người ra quyết định phi lý",
    isRecommended: false,
  },
  {
    id: "11",
    title: "Từ Tốt Đến Vĩ Đại",
    author: "Jim Collins",
    subCategory: "business",
    price: 215000,
    originalPrice: 270000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    description: "Tại sao một số công ty thành công vượt bậc",
    isRecommended: false,
  },
  {
    id: "12",
    title: "Lạm Phát Và Khủng Hoảng",
    author: "Paul Krugman",
    subCategory: "macro",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 987,
    description: "Phân tích khủng hoảng kinh tế thế giới",
    isRecommended: false,
  },
  {
    id: "13",
    title: "Đầu Tư Chứng Khoán",
    author: "William J. O'Neil",
    subCategory: "investing",
    price: 265000,
    originalPrice: 330000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1543,
    description: "Phương pháp CAN SLIM đầu tư thành công",
    isRecommended: false,
  },
  {
    id: "14",
    title: "Marketing 4.0",
    author: "Philip Kotler",
    subCategory: "business",
    price: 195000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2876,
    description: "Marketing trong kỷ nguyên số",
    isRecommended: false,
  },
  {
    id: "15",
    title: "Ngân Hàng Trung Ương",
    author: "Frederic Mishkin",
    subCategory: "finance",
    price: 285000,
    cover: "/image/anh.png",
    rating: 4.4,
    reviewCount: 876,
    description: "Chính sách tiền tệ và ngân hàng trung ương",
    isRecommended: false,
  },
  {
    id: "16",
    title: "Kinh Tế Thế Giới Phẳng",
    author: "Thomas Friedman",
    subCategory: "macro",
    price: 235000,
    originalPrice: 295000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1987,
    description: "Toàn cầu hóa trong thế kỷ 21",
    isRecommended: false,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function EconomicsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter books
  const filteredBooks =
    selectedCategory === "all"
      ? MOCK_ECONOMICS_BOOKS
      : MOCK_ECONOMICS_BOOKS.filter(
          (book) => book.subCategory === selectedCategory
        );

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
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Kinh tế</span>
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
              className="text-emerald-600"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Kinh Tế</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {filteredBooks.length} đầu sách về kinh tế, tài chính và
            đầu tư
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            onClick={() => handleCategoryChange("all")}
            variant={selectedCategory === "all" ? "primary" : "outline"}
            size="sm"
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
            Tất cả ({MOCK_ECONOMICS_BOOKS.length})
          </Button>
          <Button
            onClick={() => handleCategoryChange("macro")}
            variant={selectedCategory === "macro" ? "primary" : "outline"}
            size="sm"
          >
            Kinh tế vĩ mô (
            {
              MOCK_ECONOMICS_BOOKS.filter((b) => b.subCategory === "macro")
                .length
            }
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("micro")}
            variant={selectedCategory === "micro" ? "primary" : "outline"}
            size="sm"
          >
            Kinh tế vi mô (
            {
              MOCK_ECONOMICS_BOOKS.filter((b) => b.subCategory === "micro")
                .length
            }
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("finance")}
            variant={selectedCategory === "finance" ? "primary" : "outline"}
            size="sm"
          >
            Tài chính (
            {
              MOCK_ECONOMICS_BOOKS.filter((b) => b.subCategory === "finance")
                .length
            }
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("investing")}
            variant={selectedCategory === "investing" ? "primary" : "outline"}
            size="sm"
          >
            Đầu tư (
            {
              MOCK_ECONOMICS_BOOKS.filter((b) => b.subCategory === "investing")
                .length
            }
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("business")}
            variant={selectedCategory === "business" ? "primary" : "outline"}
            size="sm"
          >
            Kinh doanh (
            {
              MOCK_ECONOMICS_BOOKS.filter((b) => b.subCategory === "business")
                .length
            }
            )
          </Button>
        </div>

        {/* Result Count */}
        <div className="mb-6 text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
          <span className="font-semibold">
            {Math.min(endIndex, filteredBooks.length)}
          </span>{" "}
          trong tổng số{" "}
          <span className="font-semibold">{filteredBooks.length}</span> sách
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {paginatedBooks.map((book) => (
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

                {/* Recommended Badge */}
                {book.isRecommended && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block mr-1"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    ĐỀ XUẤT
                  </Badge>
                )}

                {/* BỎ badge giảm giá trên ảnh */}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 mb-2">{book.author}</p>

              {/* Price (đưa giảm giá xuống đây) */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-red-600 font-bold text-sm">
                  {formatPrice(book.price)}
                </p>
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
                <span className="text-xs text-gray-400">
                  ({book.reviewCount})
                </span>
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
