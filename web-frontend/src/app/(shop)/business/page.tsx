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
import { normalizeImageUrl } from "@/lib/imageUtils";

type Book = {
  id: string;
  title: string;
  author: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  cover: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isBestseller?: boolean;
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "name";
type SubCategory = "all" | "startup" | "marketing" | "leadership" | "strategy" | "sales" | "finance";

const SUBCATEGORIES = [
  { id: "all", name: "Tất cả"},
  { id: "startup", name: "Khởi nghiệp" },
  { id: "marketing", name: "Marketing" },
  { id: "leadership", name: "Lãnh đạo" },
  { id: "strategy", name: "Chiến lược" },
  { id: "sales", name: "Bán hàng" },
  { id: "finance", name: "Tài chính" },
];

export default function BusinessBooksPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        });
        
        if (response.items && response.items.length > 0) {
          const transformedBooks: Book[] = response.items.map((book: BookDto) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              subcategory: "all",
              price: priceInfo.finalPrice,
              originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
              cover: normalizeImageUrl(book.coverImage) || "/image/anh.png",
              rating: book.averageRating || 0,
              reviewCount: book.totalReviews || 0,
              stock: book.stockQuantity || 0,
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

  const filteredBooks =
    selectedSubcategory === "all"
      ? books
      : books.filter((book) => book.subcategory === selectedSubcategory);

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách kinh doanh</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Sách Kinh Doanh
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            {totalItems} cuốn sách kinh doanh - Bí quyết thành công trong sự nghiệp
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Lĩnh vực:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUBCATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => {
                  setSelectedSubcategory(cat.id as SubCategory);
                  setCurrentPage(1);
                }}
                variant={selectedSubcategory === cat.id ? "primary" : "outline"}
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
              <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> /{" "}
              <span className="font-semibold">{totalItems}</span>
            </div>

            <div>
              <label htmlFor="sort-business" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-business"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
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
            {paginatedBooks.map((book) => (
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

                {book.isBestseller && (
                  <div className="absolute top-2 right-2">
                    <Badge className="text-xs bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow-lg flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      BEST
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-indigo-600 font-semibold">
                  {SUBCATEGORIES.find((c) => c.id === book.subcategory)?.name}
                </p>

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

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <p className="text-red-600 font-bold text-sm">{formatPrice(book.price)}</p>
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

        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
              Xây Dựng Sự Nghiệp Thành Công
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Tư duy chiến lược</h3>
                <p className="text-sm opacity-90">Học từ những CEO và doanh nhân hàng đầu</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Kỹ năng thực chiến</h3>
                <p className="text-sm opacity-90">Áp dụng ngay vào công việc và kinh doanh</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Thành công bền vững</h3>
                <p className="text-sm opacity-90">Xây dựng nền tảng phát triển lâu dài</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
