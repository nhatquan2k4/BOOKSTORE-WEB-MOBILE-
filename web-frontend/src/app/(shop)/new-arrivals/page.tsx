"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { normalizeImageUrl, getBookCoverUrl } from "@/lib/imageUtils";

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
  const [books, setBooks] = useState<BookDto[]>([]);
  const [bookCovers, setBookCovers] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;
  const totalItems = 100; // Tạm ước tính, backend không trả về total cho API newest

  // Fetch newest books from API
  useEffect(() => {
    async function fetchNewestBooks() {
      try {
        setLoading(true);
        setError(null);
        // Gọi API /api/book/newest với top = 100 để có đủ dữ liệu cho nhiều trang
        const data = await bookService.getNewestBooks(100);
        setBooks(data);
      } catch (err) {
        console.error('Error fetching newest books:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    fetchNewestBooks();
  }, []);

  // Client-side pagination and sorting
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        // API đã sort theo newest rồi
        return 0;
      case "popular":
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      case "price-asc":
        return (a.currentPrice || 0) - (b.currentPrice || 0);
      case "price-desc":
        return (b.currentPrice || 0) - (a.currentPrice || 0);
      default:
        return 0;
    }
  });

  // Paginate
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);

  // Fetch covers for current page
  useEffect(() => {
    const fetchCovers = async () => {
      const promises = paginatedBooks.map(async (b) => {
        try {
          const url = await getBookCoverUrl(b.id);
          return { id: b.id, url };
        } catch (err) {
          console.error(`Failed to fetch cover for new arrival ${b.id}:`, err);
          return { id: b.id, url: null };
        }
      });

      const results = await Promise.all(promises);
      setBookCovers((prev) => {
        const next = { ...prev };
        results.forEach((r) => (next[r.id] = r.url));
        return next;
      });
    };

    if (paginatedBooks.length > 0) fetchCovers();
  }, [paginatedBooks]);

  // reset page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

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
            <h1 className="text-4xl font-bold text-gray-900 mt-10">
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
                <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> trong tổng số{" "}
                <span className="font-semibold">{sortedBooks.length}</span> sách
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
              {paginatedBooks.map((book) => {
                const currentPrice = book.currentPrice || book.discountPrice || 0;
                const originalPrice = book.currentPrice && book.discountPrice ? book.currentPrice : 0;
                const discount = calculateDiscount(originalPrice, currentPrice);
                const imageUrl = bookCovers[book.id] ?? normalizeImageUrl(book.coverImage);
                
                return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  {/* Book Cover */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-lg">
                        -{discount}%
                      </Badge>
                    )}

                    {/* Low stock warning */}
                    {book.stockQuantity !== undefined && book.stockQuantity < 10 && book.stockQuantity > 0 && (
                      <Badge className="absolute top-2 left-2 text-xs bg-orange-500 text-white">
                        Còn {book.stockQuantity}
                      </Badge>
                    )}
                  </div>

                  {/* Book Info */}
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {book.authorNames?.join(", ") || "Đang cập nhật"}
                  </p>

                  {/* Rating */}
                  {book.averageRating && book.averageRating > 0 && book.totalReviews && book.totalReviews > 0 ? (
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
                        {book.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({book.totalReviews})
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
                    {discount > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(originalPrice)}
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
