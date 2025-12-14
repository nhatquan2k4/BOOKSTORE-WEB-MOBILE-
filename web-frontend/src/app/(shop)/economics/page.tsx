"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";

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
// MAIN COMPONENT
// ============================================================================
export default function EconomicsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategoryFilter>("all");
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
        // Fetch books with "Kinh tế" category
        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          // categoryId: "economics-category-id", // Replace with actual category ID
        });
        
        if (response.items && response.items.length > 0) {
          // Transform API data to match component Book type
          const transformedBooks: Book[] = response.items.map((book: BookDto) => ({
            id: book.id,
            title: book.title,
            author: book.authorNames?.[0] || "Tác giả không xác định",
            cover: "/image/anh.png", // Default cover since BookDto doesn't have images array
            rating: book.averageRating || 4.5,
            reviewCount: book.totalReviews || 0,
            price: book.discountPrice || book.currentPrice || 0,
            originalPrice: book.currentPrice && book.discountPrice && book.discountPrice < book.currentPrice 
              ? book.currentPrice 
              : undefined,
            description: book.title, // Use title as description since BookDto doesn't have description
            isRecommended: (book.totalReviews || 0) > 2000,
            subCategory: "all", // Map to appropriate subcategory if available
          }));
          
          setBooks(transformedBooks);
          setTotalItems(response.totalCount || 0);
        } else {
          // No API data available
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching economics books:", error);
        // Set empty on error
        setBooks([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage]);

  // Filter books
  const filteredBooks =
    selectedCategory === "all"
      ? books
      : books.filter(
          (book) => book.subCategory === selectedCategory
        );

  // Pagination
  const totalPages = Math.ceil((totalItems || filteredBooks.length) / itemsPerPage);
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
            Tất cả ({books.length})
          </Button>
          <Button
            onClick={() => handleCategoryChange("macro")}
            variant={selectedCategory === "macro" ? "primary" : "outline"}
            size="sm"
          >
            Kinh tế vĩ mô (
            {
              books.filter((b) => b.subCategory === "macro")
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
              books.filter((b) => b.subCategory === "micro")
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
              books.filter((b) => b.subCategory === "finance")
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
              books.filter((b) => b.subCategory === "investing")
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
              books.filter((b) => b.subCategory === "business")
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
        ) : (
          /* Books Grid */
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
              <p className="text-xs text-gray-600 mb-1">{book.author}</p>

              {/* Rating */}
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
                <span className="text-xs text-gray-600">{book.rating}</span>
                <span className="text-xs text-gray-400">
                  ({book.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 flex-wrap">
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
            </Link>
          ))}
          </div>
        )}

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
