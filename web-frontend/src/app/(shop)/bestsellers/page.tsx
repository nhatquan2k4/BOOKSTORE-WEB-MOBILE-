"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";

// ============================================================================
// TYPES
// ============================================================================
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
  soldCount: number;
  rank: number;
  lastSoldDate: Date;
};

type TimeRange = "week" | "month" | "year" | "all";

// ============================================================================
// COMPONENT
// ============================================================================
export default function BestsellersPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 20; // responsive grid layout

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          // TODO: Add bestseller filter when backend supports it
          // sortBy: "soldCount",
          // timeRange: timeRange,
        });

        if (response.items && response.items.length > 0) {
          // Transform API data to match component Book type
          const transformedBooks: Book[] = response.items.map((book: BookDto, index: number) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              category: book.categoryNames?.[0] || "Chưa phân loại",
              cover: book.coverImage || "/image/anh.png",
              rating: book.averageRating || 0,
              reviewCount: book.totalReviews || 0,
              price: priceInfo.finalPrice,
              originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
                // Note: These fields should come from backend bestseller API
              rank: (currentPage - 1) * itemsPerPage + index + 1,
              soldCount: book.totalReviews * 2 || 0, // Temporary approximation
              lastSoldDate: new Date(), // Temporary placeholder
            };
          });
          setBooks(transformedBooks);
          setTotalItems(response.totalCount);
        } else {
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching bestseller books:", error);
        setBooks([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [currentPage]);

  const filterBooksByTimeRange = (books: Book[], range: TimeRange): Book[] => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    return books.filter((book) => {
      const daysDiff = Math.floor(
        (now.getTime() - book.lastSoldDate.getTime()) / oneDay
      );
      switch (range) {
        case "week":
          return daysDiff <= 7;
        case "month":
          return daysDiff <= 30;
        case "year":
          return daysDiff <= 365;
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredBooks = filterBooksByTimeRange(books, timeRange);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBooks = filteredBooks;

  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3)
      return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  // Card tái dùng
  const BookCard = ({ book }: { book: Book }) => (
    <Link
      href={`/books/${book.id}`}
      className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group relative"
    >
      {/* Rank badge */}
      <div
        className={`absolute -top-2 -left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${getRankBadgeClass(
          book.rank
        )}`}
      >
        {book.rank}
      </div>

      {/* Cover */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* HOT badge */}
        {book.rank <= 10 && (
          <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="inline-block mr-1"
            >
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
            </svg>
            HOT
          </Badge>
        )}

        {/* sold count */}
        <Badge className="absolute bottom-2 left-2 text-xs bg-black/70 text-white">
          Đã bán: {book.soldCount.toLocaleString()}
        </Badge>
      </div>

      {/* Info */}
      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
      <p className="text-xs text-gray-600 mb-1">{book.author}</p>

      {/* Price line with discount */}
      <div className="flex flex-wrap items-center gap-2 mt-auto">
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
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách bán chạy</span>
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
              className="text-orange-500"
            >
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Sách Bán Chạy</h1>
          </div>
          {/* dùng filteredBooks.length để khớp filter */}
          <p className="text-gray-600 text-lg">
            Top {filteredBooks.length} cuốn sách được yêu thích nhất
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            variant={timeRange === "week" ? "primary" : "secondary"}
            onClick={() => setTimeRange("week")}
            className="rounded-full"
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
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Tuần này
          </Button>
          <Button
            variant={timeRange === "month" ? "primary" : "secondary"}
            onClick={() => setTimeRange("month")}
            className="rounded-full"
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
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Tháng này
          </Button>
          <Button
            variant={timeRange === "year" ? "primary" : "secondary"}
            onClick={() => setTimeRange("year")}
            className="rounded-full"
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
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Năm nay
          </Button>
          <Button
            variant={timeRange === "all" ? "primary" : "secondary"}
            onClick={() => setTimeRange("all")}
            className="rounded-full"
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
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Mọi lúc
          </Button>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-semibold text-gray-900">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold text-gray-900">
              {totalItems}
            </span>{" "}
            sách
          </p>
          <p className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
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
