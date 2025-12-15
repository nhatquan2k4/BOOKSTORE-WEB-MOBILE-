"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useBooks, useCategories, type Book } from "@/hooks";

// ============================================================================
// TYPES
// ============================================================================
type SubCategoryFilter = string;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LiteraturePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [literatureCategoryId, setLiteratureCategoryId] = useState<string | null>(null);
  const itemsPerPage = 20;

  // Fetch categories to find "Văn học" category
  const { categories } = useCategories();

  // Fetch books with literature category filter
  const { books, totalPages, loading, error } = useBooks({
    page: currentPage,
    pageSize: itemsPerPage,
    categoryId: literatureCategoryId || undefined,
  });

  // Find literature category ID on mount
  useEffect(() => {
    if (categories.length > 0 && !literatureCategoryId) {
      const literatureCategory = categories.find(
        (cat) => cat.name.toLowerCase().includes('văn học') || cat.name.toLowerCase().includes('literature')
      );
      if (literatureCategory) {
        setLiteratureCategoryId(literatureCategory.id);
      }
    }
  }, [categories, literatureCategoryId]);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + books.length;
  
  // Filter books by subcategory if selected
  const displayBooks = selectedCategory === "all" 
    ? books 
    : books.filter((book: Book) => 
        book.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );

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
          / <span className="font-medium text-gray-800">Văn học</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Văn Học</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {loading ? "Đang tải..." : `Khám phá ${displayBooks.length} tác phẩm văn học kinh điển và đương đại`}
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
            onClick={() => handleCategoryChange("tiểu thuyết")}
            variant={selectedCategory === "tiểu thuyết" ? "primary" : "outline"}
            size="sm"
          >
            Tiểu thuyết
          </Button>
          <Button
            onClick={() => handleCategoryChange("thơ")}
            variant={selectedCategory === "thơ" ? "primary" : "outline"}
            size="sm"
          >
            Thơ
          </Button>
          <Button
            onClick={() => handleCategoryChange("tản văn")}
            variant={selectedCategory === "tản văn" ? "primary" : "outline"}
            size="sm"
          >
            Tản văn
          </Button>
          <Button
            onClick={() => handleCategoryChange("kinh điển")}
            variant={selectedCategory === "kinh điển" ? "primary" : "outline"}
            size="sm"
          >
            Kinh điển
          </Button>
          <Button
            onClick={() => handleCategoryChange("đương đại")}
            variant={selectedCategory === "đương đại" ? "primary" : "outline"}
            size="sm"
          >
            Đương đại
          </Button>
        </div>

        {/* Result Count */}
        {!loading && displayBooks.length > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, displayBooks.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{displayBooks.length}</span> sách
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Có lỗi xảy ra khi tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayBooks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Không tìm thấy sách văn học nào</p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && displayBooks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {displayBooks.map((book: Book) => {
              const currentPrice = book.salePrice || book.price;
              const originalPrice = book.salePrice ? book.price : book.originalPrice;
              const discount = originalPrice ? calculateDiscount(originalPrice, currentPrice) : 0;
              const imageUrl = book.imageUrl || book.cover || '/image/anh.png';
              const authors = book.author || '';

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
                    {discount > 0 && (
                      <Badge className="absolute top-2 right-2 text-xs bg-red-500 text-white font-bold shadow-lg">
                        -{discount}%
                      </Badge>
                    )}

                    {/* Low Stock Badge */}
                    {book.stock && book.stock > 0 && book.stock < 10 && (
                      <Badge className="absolute top-2 left-2 text-xs bg-orange-500 text-white font-bold shadow-lg">
                        Còn {book.stock}
                      </Badge>
                    )}
                  </div>

                  {/* Book Info */}
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-1">{authors}</p>

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
                    <span className="text-xs text-gray-600">{book.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-400">
                      ({book.reviewCount || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-red-600 font-bold text-sm">
                      {formatPrice(currentPrice)}
                    </p>
                    {originalPrice && (
                      <>
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(originalPrice)}
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
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
