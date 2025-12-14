"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";

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
  level: "Beginner" | "Intermediate" | "Advanced";
  year: number;
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "newest";
type SubCategory = "all" | "web" | "mobile" | "data-science" | "ai-ml" | "devops" | "game";

const SUBCATEGORIES = [
  { 
    id: "all", 
    name: "Tất cả", 
  },
  { 
    id: "web", 
    name: "Web Development", 
  },
  { 
    id: "mobile", 
    name: "Mobile Apps", 
  },
  { 
    id: "data-science", 
    name: "Data Science", 
  },
  { 
    id: "ai-ml", 
    name: "AI & Machine Learning", 
  },
  { 
    id: "devops", 
    name: "DevOps", 
  },
  { 
    id: "game", 
    name: "Game Development", 
  },
];

export default function ProgrammingBooksPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          // TODO: Add programming category filter when backend supports it
          // categoryId: "programming-category-id",
        });

        if (response.items && response.items.length > 0) {
          const transformedBooks: Book[] = response.items.map((book: BookDto) => ({
            id: book.id,
            title: book.title,
            author: book.authorNames?.[0] || "Tác giả không xác định",
            subcategory: "all", // TODO: Map from book categories
            price: book.discountPrice || book.currentPrice || 0,
            originalPrice:
              book.currentPrice && book.discountPrice && book.discountPrice < book.currentPrice
                ? book.currentPrice
                : undefined,
            cover: "/image/anh.png",
            rating: book.averageRating || 4.5,
            reviewCount: book.totalReviews || 0,
            stock: 50, // TODO: Get from inventory API
            level: "Intermediate", // TODO: Add level info from backend
            year: new Date().getFullYear(),
          }));
          setBooks(transformedBooks);
          setTotalItems(response.totalCount);
        } else {
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching programming books:", error);
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
      case "newest":
        return b.year - a.year;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBooks = sortedBooks;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-blue-100 text-blue-700";
      case "Advanced":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-slate-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách lập trình</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-700 to-gray-900 bg-clip-text text-transparent">
              Sách Lập Trình
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            {totalItems} cuốn sách lập trình chất lượng cao - Từ cơ bản đến nâng cao
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Chuyên ngành:</h3>
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
          <div className="text-sm text-gray-600 mb-4">
              Hiển thị <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
              <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> /{" "}
              <span className="font-semibold">{totalItems}</span> sách
            </div>

            <div>
              <label htmlFor="sort-programming" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-programming"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl bg-white p-3 shadow-sm">
                <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
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

                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {book.year === 2024 && (
                    <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">
                      MỚI 2024
                    </Badge>
                  )}
                </div>

                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${getLevelColor(
                    book.level
                  )}`}
                >
                  {book.level}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-slate-700 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                  {SUBCATEGORIES.find((c) => c.id === book.subcategory)?.name}
                </p>

                <div className="flex items-center gap-1 pt-1">
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

        <div className="mt-12 bg-gradient-to-r from-slate-700 to-gray-900 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Học Lập Trình Hiệu Quả
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Kiến thức nền tảng</h3>
                <p className="text-sm opacity-90">Từ cơ bản đến nâng cao, có hệ thống</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Thực hành thực tế</h3>
                <p className="text-sm opacity-90">Các ví dụ và bài tập từ dự án thực tế</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Cập nhật liên tục</h3>
                <p className="text-sm opacity-90">Theo kịp công nghệ và xu hướng mới nhất</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
