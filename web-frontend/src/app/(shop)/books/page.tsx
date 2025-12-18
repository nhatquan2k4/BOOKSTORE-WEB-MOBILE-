"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useBooks, type Book } from "@/hooks";

type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "name";
type PriceRange =
  | "all"
  | "under-100k"
  | "100k-300k"
  | "300k-500k"
  | "over-500k";

// Categories for filtering
const CATEGORIES = [
  { id: "all", name: "Tất cả" },
  { id: "Văn học", name: "Văn học" },
  { id: "Kỹ năng sống", name: "Kỹ năng sống" },
  { id: "Kinh tế", name: "Kinh tế" },
  { id: "Kinh doanh", name: "Kinh doanh" },
  { id: "Khoa học", name: "Khoa học" },
  { id: "Lập trình", name: "Lập trình" },
  { id: "Tâm lý học", name: "Tâm lý học" },
];

export default function AllBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Categories loaded from API if needed

  // Determine sort field for API
  const getSortBy = (): string | undefined => {
    switch (sortBy) {
      case "price-asc":
        return "price";
      case "price-desc":
        return "price_desc";
      case "rating":
        return "rating";
      case "name":
        return "title";
      default:
        return undefined;
    }
  };

  // Fetch books with filters
  const { books, totalPages, loading, error } = useBooks({
    page: currentPage,
    pageSize: itemsPerPage,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    sortBy: getSortBy(),
  });

  // Client-side price filtering (API doesn't support price range filter)
  const priceFilteredBooks = books.filter((book: Book) => {
    const bookPrice = book.salePrice || book.price;
    switch (priceRange) {
      case "under-100k":
        return bookPrice < 100000;
      case "100k-300k":
        return bookPrice >= 100000 && bookPrice < 300000;
      case "300k-500k":
        return bookPrice >= 300000 && bookPrice < 500000;
      case "over-500k":
        return bookPrice >= 500000;
      default:
        return true;
    }
  });

  const displayBooks = priceFilteredBooks;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + displayBooks.length;

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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return books.length;
    return books.filter((book: Book) => book.category === categoryId).length;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Tất cả sách</span>
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
            <h1 className="text-4xl font-bold text-gray-900">Tất Cả Sách</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {loading ? "Đang tải..." : `Khám phá ${displayBooks.length} đầu sách từ nhiều thể loại khác nhau`}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Danh mục:
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  variant={selectedCategory === cat.id ? "primary" : "outline"}
                  size="md"
                  className={selectedCategory === cat.id ? "shadow-lg" : ""}
                >
                  {cat.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({getCategoryCount(cat.id)})
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Price & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price-range"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Khoảng giá:
              </label>
              <select
                id="price-range"
                value={priceRange}
                onChange={(e) =>
                  handlePriceRangeChange(e.target.value as PriceRange)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="under-100k">Dưới 100.000₫</option>
                <option value="100k-300k">100.000₫ - 300.000₫</option>
                <option value="300k-500k">300.000₫ - 500.000₫</option>
                <option value="over-500k">Trên 500.000₫</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sort-by"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Sắp xếp:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Result info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, displayBooks.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{displayBooks.length}</span> sách
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
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
                className="text-orange-500"
              >
                <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
              </svg>
              <span className="text-gray-600">
                {books.filter((b: Book) => b.isBestseller).length} Best Seller
              </span>
            </div>
            <div className="flex items-center gap-2">
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
                className="text-green-500"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-gray-600">
                {books.filter((b: Book) => b.isNew).length} Sách mới
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Có lỗi xảy ra khi tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Books grid */}
        {!loading && !error && displayBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {displayBooks.map((book: Book) => {
              const currentPrice = book.salePrice || book.price;
              const originalPrice = book.salePrice ? book.price : book.originalPrice;
              const imageUrl = book.coverImage || '/image/anh.png';
              
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  {/* Cover */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    <Image
                      src={imageUrl}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Right badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {book.isBestseller && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="inline-block mr-1"
                        >
                          <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                        </svg>
                        HOT
                      </Badge>
                    )}
                    {book.isNew && (
                      <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
                        MỚI
                      </Badge>
                    )}
                  </div>

                  {/* stock badge */}
                  {book.stock !== undefined && book.stock < 10 && book.stock > 0 && (
                    <Badge
                      variant="warning"
                      className="absolute bottom-2 left-2 text-xs bg-amber-400 text-amber-900"
                    >
                      Chỉ còn {book.stock}
                    </Badge>
                  )}
                  {book.stock !== undefined && book.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" className="text-sm font-bold">
                        HẾT HÀNG
                      </Badge>
                    </div>
                  )}

                  {/* bỏ badge giảm giá trên ảnh */}
                </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500">{book.category}</p>

                    {/* Rating */}
                    {book.rating && book.rating > 0 && book.reviewCount && book.reviewCount > 0 ? (
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
                        <span className="text-xs text-gray-600">{book.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">
                          ({book.reviewCount})
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 pt-1">Đang cập nhật</div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <p className="text-red-600 font-bold text-sm">
                        {formatPrice(currentPrice)}
                      </p>
                      {originalPrice && (
                        <>
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </p>
                          <Badge variant="danger" className="text-xs font-bold">
                            -{calculateDiscount(originalPrice, currentPrice)}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sách
            </h3>
            <p className="text-gray-600 mb-6">
              Không có sách nào phù hợp với bộ lọc của bạn.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange("all");
                setCurrentPage(1);
              }}
              variant="primary"
              size="md"
            >
              Xóa bộ lọc
            </Button>
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
