"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { bookService, categoryService } from "@/services";
import type { BookDto, CategoryDto } from "@/types/dtos";

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "newest";

const formatVnd = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

const calculateDiscount = (original: number, current: number) => {
  if (original <= 0 || current <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<CategoryDto | null>(null);
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      try {
        const categoryData = await categoryService.getCategoryById(categoryId);
        setCategory(categoryData);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // Fetch books in category
  useEffect(() => {
    const fetchBooks = async () => {
      if (!categoryId) return;
      setLoading(true);
      try {
        const response = await bookService.getBooks({
          categoryId,
          pageNumber: currentPage,
          pageSize,
        });
        setBooks(response.items || []);
        setTotalPages(Math.ceil((response.totalCount || 0) / pageSize));
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [categoryId, currentPage]);

  // Sort books
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      case "price-asc":
        return (a.currentPrice || 0) - (b.currentPrice || 0);
      case "price-desc":
        return (b.currentPrice || 0) - (a.currentPrice || 0);
      case "newest":
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          /{" "}
          <Link href="/categories" className="hover:text-blue-600">
            Danh mục
          </Link>{" "}
          / <span className="font-medium text-gray-800">{category?.name || "..."}</span>
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
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">
              {category?.name || "Đang tải..."}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {category?.description || "Khám phá các đầu sách trong danh mục này"}
          </p>
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {sortedBooks.length} sản phẩm
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl bg-white p-3 shadow-sm animate-pulse">
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-400"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sách
            </h3>
            <p className="text-gray-600 mb-6">
              Hiện tại chưa có sách nào trong danh mục này.
            </p>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {sortedBooks.map((book) => {
                const bookOriginalPrice = book.currentPrice || 0;
                const bookDiscountPrice = book.discountPrice || 0;
                const hasDiscount = bookDiscountPrice > 0 && bookDiscountPrice < bookOriginalPrice;
                const discountPercent = hasDiscount
                  ? calculateDiscount(bookOriginalPrice, bookDiscountPrice)
                  : 0;
                const finalPrice = hasDiscount ? bookDiscountPrice : bookOriginalPrice;
                const isBestseller = (book.totalReviews || 0) > 100;

                return (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                  >
                    {/* Book Cover */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                      <Image
                        src="/image/anh.png"
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Bestseller Badge */}
                      {isBestseller && (
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
                    </div>

                    {/* Book Info */}
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      {book.authorNames?.join(", ") || "Đang cập nhật"}
                    </p>

                    {/* Rating */}
                    {book.averageRating && book.totalReviews > 0 ? (
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
                      <div className="text-xs text-gray-400 mb-2">
                        Đang cập nhật
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-red-600 font-bold text-sm">
                        {formatVnd(finalPrice)}
                      </p>
                      {hasDiscount && (
                        <>
                          <p className="text-xs text-gray-400 line-through">
                            {formatVnd(bookOriginalPrice)}
                          </p>
                          <Badge variant="danger" className="text-xs font-bold">
                            -{discountPercent}%
                          </Badge>
                        </>
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
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    if (typeof window !== "undefined") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
