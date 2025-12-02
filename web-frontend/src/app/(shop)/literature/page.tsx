"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

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
  isClassic: boolean;
};

type SubCategoryFilter =
  | "all"
  | "fiction"
  | "poetry"
  | "essay"
  | "classic"
  | "contemporary";

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_LITERATURE_BOOKS: Book[] = [
  {
    id: "1",
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    subCategory: "contemporary",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    description: "Truyện kể về tình yêu đầu đời trong trẻo và ngây thơ",
    isClassic: false,
  },
  {
    id: "2",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    subCategory: "fiction",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    description: "Hành trình tìm kiếm kho báu và ý nghĩa cuộc sống",
    isClassic: true,
  },
  {
    id: "3",
    title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    author: "Nguyễn Nhật Ánh",
    subCategory: "contemporary",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    description: "Tuổi thơ nghèo khó nhưng giàu tình cảm",
    isClassic: false,
  },
  {
    id: "4",
    title: "Số Đỏ",
    author: "Vũ Trọng Phụng",
    subCategory: "classic",
    price: 115000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    description: "Tác phẩm phê phán xã hội sắc sảo",
    isClassic: true,
  },
  {
    id: "5",
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    subCategory: "fiction",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    description: "Câu chuyện cảm động về tuổi thơ và gia đình",
    isClassic: true,
  },
  {
    id: "6",
    title: "Đất Rừng Phương Nam",
    author: "Đoàn Giỏi",
    subCategory: "classic",
    price: 98000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1987,
    description: "Vùng đất miền Nam hoang vu và thơ mộng",
    isClassic: true,
  },
  {
    id: "7",
    title: "Tuyển Tập Thơ Xuân Diệu",
    author: "Xuân Diệu",
    subCategory: "poetry",
    price: 145000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1234,
    description: "Những vần thơ tình bất hủ",
    isClassic: true,
  },
  {
    id: "8",
    title: "Lão Hạc",
    author: "Nam Cao",
    subCategory: "classic",
    price: 75000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    description: "Bi kịch của người nghèo trong xã hội cũ",
    isClassic: true,
  },
  {
    id: "9",
    title: "Dế Mèn Phiêu Lưu Ký",
    author: "Tô Hoài",
    subCategory: "classic",
    price: 85000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 3456,
    description: "Hành trình khám phá thế giới của chú dế",
    isClassic: true,
  },
  {
    id: "10",
    title: "Vợ Nhặt",
    author: "Kim Lân",
    subCategory: "classic",
    price: 68000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    description: "Tình người trong hoạn nạn",
    isClassic: true,
  },
  {
    id: "11",
    title: "Chiến Thắng",
    author: "Nguyễn Nhật Ánh",
    subCategory: "contemporary",
    price: 105000,
    originalPrice: 135000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    description: "Cuộc sống đầy màu sắc của tuổi học trò",
    isClassic: false,
  },
  {
    id: "12",
    title: "Mười Năm Ở Sài Gòn",
    author: "Phạm Công Thiện",
    subCategory: "essay",
    price: 155000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 987,
    description: "Hồi ký về Sài Gòn những năm 1950-1960",
    isClassic: false,
  },
  {
    id: "13",
    title: "Truyện Kiều",
    author: "Nguyễn Du",
    subCategory: "poetry",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    description: "Kiệt tác văn học cổ điển Việt Nam",
    isClassic: true,
  },
  {
    id: "14",
    title: "Rừng Xà Nu",
    author: "Nguyễn Trung Thành",
    subCategory: "fiction",
    price: 125000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1543,
    description: "Đại ngàn Tây Nguyên hùng vĩ",
    isClassic: false,
  },
  {
    id: "15",
    title: "Chí Phèo",
    author: "Nam Cao",
    subCategory: "classic",
    price: 78000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    description: "Số phận bi thảm của người dân nghèo",
    isClassic: true,
  },
  {
    id: "16",
    title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
    author: "Nguyễn Nhật Ánh",
    subCategory: "contemporary",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3654,
    description: "Hồi ức về những ngày thơ ấu",
    isClassic: false,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LiteraturePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter books
  const filteredBooks =
    selectedCategory === "all"
      ? MOCK_LITERATURE_BOOKS
      : MOCK_LITERATURE_BOOKS.filter(
          (book) => book.subCategory === selectedCategory
        );

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
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
          / <span className="font-medium text-gray-800">Văn học</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Văn Học</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {filteredBooks.length} tác phẩm văn học kinh điển và đương
            đại
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
            Tất cả ({MOCK_LITERATURE_BOOKS.length})
          </Button>
          <Button
            onClick={() => handleCategoryChange("fiction")}
            variant={selectedCategory === "fiction" ? "primary" : "outline"}
            size="sm"
          >
            Tiểu thuyết (
            {
              MOCK_LITERATURE_BOOKS.filter((b) => b.subCategory === "fiction")
                .length
            }
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("poetry")}
            variant={selectedCategory === "poetry" ? "primary" : "outline"}
            size="sm"
          >
            Thơ (
            {MOCK_LITERATURE_BOOKS.filter((b) => b.subCategory === "poetry")
              .length}
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("essay")}
            variant={selectedCategory === "essay" ? "primary" : "outline"}
            size="sm"
          >
            Tản văn (
            {MOCK_LITERATURE_BOOKS.filter((b) => b.subCategory === "essay")
              .length}
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("classic")}
            variant={selectedCategory === "classic" ? "primary" : "outline"}
            size="sm"
          >
            Kinh điển (
            {MOCK_LITERATURE_BOOKS.filter((b) => b.subCategory === "classic")
              .length}
            )
          </Button>
          <Button
            onClick={() => handleCategoryChange("contemporary")}
            variant={selectedCategory === "contemporary" ? "primary" : "outline"}
            size="sm"
          >
            Đương đại (
            {
              MOCK_LITERATURE_BOOKS.filter(
                (b) => b.subCategory === "contemporary"
              ).length
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

        {/* Books Grid */}
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

                {/* Classic Badge */}
                {book.isClassic && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-lg">
                    KINH ĐIỂN
                  </Badge>
                )}

                {/* ĐÃ BỎ badge giảm giá trên ảnh */}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
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
