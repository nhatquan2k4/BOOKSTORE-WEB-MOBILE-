"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { useBooks, type Book } from "@/hooks";

// ============================================================================
// TYPES
// ============================================================================
type SortOption = "newest" | "popular" | "price-asc" | "price-desc";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function NewArrivalsPage() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Map sort options to API format
  const getSortBy = () => {
    switch (sortBy) {
      case "newest":
        return "createdAt_desc"; // Sort by creation date descending
      case "popular":
        return "popular";
      case "price-asc":
        return "price_asc";
      case "price-desc":
        return "price_desc";
      default:
        return undefined;
    }
  };

  // Fetch books from API
  const { books, totalPages, loading, error } = useBooks({
    page: currentPage,
    pageSize: itemsPerPage,
    sortBy: getSortBy(),
  });

  // reset page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Calculate pagination info
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, startIndex + books.length);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate discount
  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
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
          / <span className="font-medium text-gray-800">Sách mới</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Sách Mới Phát Hành
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá những đầu sách mới nhất được phát hành gần đây
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Có lỗi xảy ra: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Không tìm thấy sách nào</p>
          </div>
        )}

        {/* Content - Only show when not loading and has data */}
        {!loading && !error && books.length > 0 && (
          <>
            {/* Filters & Sort */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
                <span className="font-semibold">{endIndex}</span> trong tổng số{" "}
                <span className="font-semibold">{totalPages * itemsPerPage}</span> sách
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Phổ biến nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {books.map((book: Book) => {
                const currentPrice = book.salePrice || book.price;
                const imageUrl = book.imageUrl || book.cover || "/placeholder-book.png";
                
                return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  {/* Book Cover */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    <Image
                      src={imageUrl}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount Badge */}
                    {book.originalPrice && book.originalPrice > currentPrice && (
                      <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-lg">
                        -{calculateDiscount(book.originalPrice, currentPrice)}%
                      </Badge>
                    )}

                    {/* Low stock warning */}
                    {book.stock !== undefined && book.stock < 10 && book.stock > 0 && (
                      <Badge className="absolute top-2 left-2 text-xs bg-orange-500 text-white">
                        Còn {book.stock}
                      </Badge>
                    )}
                  </div>

                  {/* Book Info */}
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">{book.author}</p>

                  {/* Rating */}
                  {book.rating && book.rating > 0 && book.reviewCount && book.reviewCount > 0 ? (
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
                      <span className="text-xs text-gray-600">
                        {book.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({book.reviewCount})
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mb-2">Đang cập nhật</div>
                  )}

                  {/* Price */}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-red-600 font-bold text-sm">
                      {formatPrice(currentPrice)}
                    </p>
                    {book.originalPrice && book.originalPrice > currentPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(book.originalPrice)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
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
          </>
        )}
      </div>
    </main>
  );
}
