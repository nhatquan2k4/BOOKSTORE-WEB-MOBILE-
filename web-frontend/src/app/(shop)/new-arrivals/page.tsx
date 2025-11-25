"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

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
  publishDate: string;
  isNew: boolean;
};

type SortOption = "newest" | "popular" | "price-asc" | "price-desc";

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_NEW_BOOKS: Book[] = [
  {
    id: "1",
    title: "Atomic Habits - Thói Quen Nguyên Tử",
    author: "James Clear",
    category: "Kỹ năng sống",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    publishDate: "2024-11-01",
    isNew: true,
  },
  {
    id: "2",
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    publishDate: "2024-10-28",
    isNew: true,
  },
  {
    id: "3",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    category: "Tâm lý học",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    publishDate: "2024-10-25",
    isNew: true,
  },
  {
    id: "4",
    title: "Nghệ Thuật Bán Hàng Vĩ Đại",
    author: "Brian Tracy",
    category: "Kinh doanh",
    price: 168000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 876,
    publishDate: "2024-10-20",
    isNew: true,
  },
  {
    id: "5",
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    publishDate: "2024-10-15",
    isNew: true,
  },
  {
    id: "6",
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    category: "Kinh tế",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    publishDate: "2024-10-12",
    isNew: true,
  },
  {
    id: "7",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5678,
    publishDate: "2024-10-10",
    isNew: true,
  },
  {
    id: "8",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    publishDate: "2024-10-08",
    isNew: true,
  },
  {
    id: "9",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    category: "Kỹ năng sống",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    publishDate: "2024-10-05",
    isNew: true,
  },
  {
    id: "10",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 280000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3421,
    publishDate: "2024-10-03",
    isNew: true,
  },
  {
    id: "11",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    category: "Kinh doanh",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    publishDate: "2024-10-01",
    isNew: true,
  },
  {
    id: "12",
    title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    publishDate: "2024-09-28",
    isNew: true,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function NewArrivalsPage() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sort books
  const sortedBooks = [...MOCK_NEW_BOOKS].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // reset page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
          / <span className="font-medium text-gray-800">Sách mới</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Sách Mới Phát Hành
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {MOCK_NEW_BOOKS.length} đầu sách mới nhất được phát hành
            gần đây
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, sortedBooks.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{sortedBooks.length}</span> sách
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {paginatedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100"
            >
              {/* Book Cover */}
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* NEW Badge */}
                {book.isNew && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
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
                    MỚI
                  </Badge>
                )}

                {/* BỎ discount badge trên ảnh */}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 mb-1">{book.author}</p>
              <p className="text-xs text-gray-500 mb-2">
                Phát hành: {formatDate(book.publishDate)}
              </p>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
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

              {/* Rating */}
              <div className="flex items-center gap-1">
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
            </Link>
          ))}
        </div>

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
