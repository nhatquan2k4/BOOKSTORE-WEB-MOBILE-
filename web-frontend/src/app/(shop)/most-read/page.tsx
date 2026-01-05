"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";
import { normalizeImageUrl, getBookCoverUrl } from "@/lib/imageUtils";

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

export default function MostReadBooksPage() {
  const [sortBy, setSortBy] = useState<SortOption>("read-count");
  const [timeRange, setTimeRange] = useState<TimeRange>("all-time");
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
              readCount: Math.floor(Math.random() * 100000) + 10000,
              stock: 100,
              trend: "stable" as "up" | "down" | "stable",
            };
          });

          // Fetch per-book covers when available
          try {
            const coverPromises = transformedBooks.map(async (tb) => {
              try {
                const apiCover = await getBookCoverUrl(tb.id);
                return apiCover || tb.cover;
              } catch (e) {
                return tb.cover;
              }
            });

            const coverResults = await Promise.all(coverPromises);
            const updated = transformedBooks.map((tb, idx) => ({ ...tb, cover: coverResults[idx] || tb.cover }));
            setBooks(updated);
          } catch (e) {
            setBooks(transformedBooks);
          }

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

  const totalReadCount = books.reduce((acc, book) => acc + book.readCount, 0);

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
            <Link key={book.id} href={`/books/${book.id}`}>
              <Card className="flex flex-col h-full rounded-xl bg-white shadow-sm transition hover:shadow-lg group">
                <CardContent className="p-3">
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.cover || "/image/anh.png"}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                      onError={(e) => { (e.target as HTMLImageElement).src = '/image/anh.png'; }}
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
                          <span className="text-xs font-bold text-gray-700">{book.rating}</span>
                          <span className="text-xs text-gray-500">({book.reviewCount})</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Đang cập nhật</span>
                      )}
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
