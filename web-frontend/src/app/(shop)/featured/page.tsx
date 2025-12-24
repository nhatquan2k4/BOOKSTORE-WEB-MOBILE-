"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";
import { normalizeImageUrl } from "@/lib/imageUtils";

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
  stock: number;
  featuredReason: string;
  highlight?: string;
};

type SortOption = "featured" | "rating" | "price-asc" | "price-desc" | "name";

export default function FeaturedBooksPage() {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: currentPage || 1,
          pageSize: 20,
        });
        
        if (response.items && response.items.length > 0) {
          const transformedBooks: Book[] = response.items.map((book: BookDto) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id.toString(),
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              category: book.categoryNames?.[0] || "Chưa phân loại",
              price: priceInfo.finalPrice,
              originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
              cover: normalizeImageUrl(book.coverImage) || "/image/anh.png",
              rating: book.averageRating || 0,
              reviewCount: book.totalReviews || 0,
              stock: 100,
              featuredReason: "Sách nổi bật",
              highlight: priceInfo.hasDiscount ? "Giảm giá" : undefined,
            };
          });
          setBooks(transformedBooks);
          setTotalItems(response.totalCount || 0);
        } else {
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [currentPage]);

  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "featured":
        return b.reviewCount - a.reviewCount;
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách nổi bật</span>
        </nav>

        {/* Hero */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
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
                className="text-orange-600"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="m19.84 4.61-.01-.01a5.5 5.5 0 0 0-7.78 0L12 4.67l-.05-.05a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l6.77-6.77 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Sách Nổi Bật
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium">
            {totalItems} đầu sách được chọn lọc kỹ càng - Những tác phẩm xuất sắc nhất
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
              <span className="font-semibold">
                {Math.min(endIndex, sortedBooks.length)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{sortedBooks.length}</span> sách
            </div>

            <div>
              <label htmlFor="sort-featured" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-featured"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 bg-white"
              >
                <option value="featured">Nổi bật nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid books */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {paginatedBooks.map((book, index) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {index < 3 && (
                  <div className="absolute top-2 left-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                )}

                {book.highlight && (
                  <div className="absolute top-2 right-2">
                    <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                      {book.highlight}
                    </Badge>
                  </div>
                )}

                {/* BỎ badge giảm giá trên ảnh */}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  {book.author}
                </p>
                <p className="text-xs text-orange-600 font-semibold">
                  {book.category}
                </p>

                <div className="bg-orange-50 rounded-md p-2 mt-2">
                  <p className="text-xs text-orange-800 font-medium line-clamp-2 flex items-start gap-1">
                    <svg
                      className="w-3.5 h-3.5 mt-[2px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 11 2-2 4 4 8-8 2 2-10 10Z" />
                    </svg>
                    {book.featuredReason}
                  </p>
                </div>

                <div className="flex items-center gap-1 pt-1">
                  {book.rating > 0 && book.reviewCount > 0 ? (
                    <>
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
                      <span className="text-xs font-bold text-gray-700">
                        {book.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({book.reviewCount})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Đang cập nhật</span>
                  )}
                </div>

                {/* Giá + giá gốc + % giảm */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <p className="text-orange-600 font-bold text-sm">
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
              </div>
            </Link>
          ))}
          </div>
        )}

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
