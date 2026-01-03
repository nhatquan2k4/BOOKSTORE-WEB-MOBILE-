"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService, categoryService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";
import { normalizeImageUrl } from "@/lib/imageUtils";

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
  isBestseller: boolean;
};

type SubCategoryFilter =
  | "all"
  | "habits"
  | "productivity"
  | "communication"
  | "mindset"
  | "leadership";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LifeSkillsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [lifeSkillsCategoryId, setLifeSkillsCategoryId] = useState<string | null>(null);
  const itemsPerPage = 20;

  // Fetch Life Skills Category ID
  useEffect(() => {
    const fetchCategoryId = async () => {
      try {
        const response = await categoryService.getCategories(1, 100);
        const lifeSkillsCategory = response.items?.find(
          (cat) => cat.name === "Kỹ năng sống" || cat.name.includes("Kỹ năng")
        );
        if (lifeSkillsCategory) {
          setLifeSkillsCategoryId(lifeSkillsCategory.id);
        }
      } catch (error) {
        console.error("Error fetching life-skills category:", error);
      }
    };
    fetchCategoryId();
  }, []);

  // Fetch books from API
  useEffect(() => {
    if (!lifeSkillsCategoryId) return;
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Fetch books with "Kỹ năng sống" category
        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          categoryId: lifeSkillsCategoryId,
        });
        
        if (response.items && response.items.length > 0) {
          // Transform API data to match component Book type
          const transformedBooks: Book[] = response.items.map((book: BookDto) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              cover: normalizeImageUrl(book.coverImage) || "/image/anh.png",
              rating: book.averageRating || 0,
              reviewCount: book.totalReviews || 0,
              price: priceInfo.finalPrice,
              originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
                description: book.title, // Use title as description since BookDto doesn't have description
              isBestseller: (book.totalReviews || 0) > 1000,
              subCategory: "all", // Map to appropriate subcategory if available
            };
          });
          
          setBooks(transformedBooks);
          setTotalItems(response.totalCount || 0);
        } else {
          // No API data available
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching life-skills books:", error);
        // Set empty on error
        setBooks([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, lifeSkillsCategoryId]);

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
    if (original <= 0 || current <= 0 || current >= original) return 0;
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
          / <span className="font-medium text-gray-800">Kỹ năng sống</span>
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
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Kỹ Năng Sống</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {filteredBooks.length} cuốn sách giúp bạn phát triển bản
            thân
          </p>
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
                {book.cover ? (
                  <Image
                    src={book.cover}
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

                {/* Bestseller Badge */}
                {book.isBestseller && (
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

                {/* BỎ badge giảm giá trên ảnh */}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 mb-1">{book.author}</p>

              {/* Rating */}
              {book.rating > 0 && book.reviewCount > 0 ? (
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
                  <span className="text-xs text-gray-600">{book.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">
                    ({book.reviewCount})
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
